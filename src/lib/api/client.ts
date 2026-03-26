import { toast } from "sonner";
import { API_V1 } from "./config";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokens";
import { ApiError } from "./types/common";
import type { APIResponse, APIError as APIErrorType } from "./types/common";
import type { TokenPair } from "./types/auth";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function authHeadersNoContentType(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token");

    const res = await fetch(`${API_V1}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    const body = await parseJson<TokenPair>(res);
    if (body.data) {
      setTokens(body.data);
    }
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function handleRateLimit(res: Response): void {
  const retryAfter = res.headers.get("Retry-After");
  const seconds = retryAfter ? parseInt(retryAfter, 10) : null;

  if (seconds && !Number.isNaN(seconds) && seconds > 0) {
    toast.error(`Rate limited. Retry in ${seconds} second${seconds === 1 ? "" : "s"}.`);
  } else {
    toast.error("Rate limited. Please wait before retrying.");
  }
}

async function parseJson<R>(res: Response): Promise<APIResponse<R>> {
  const text = await res.text();
  try {
    return JSON.parse(text) as APIResponse<R>;
  } catch {
    // For 500s with non-JSON bodies, surface the raw response so the real
    // error is visible rather than a generic "server unavailable" message.
    const preview = text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);
    throw new ApiError({
      code: "NETWORK_ERROR",
      message:
        res.status >= 500
          ? preview
            ? `Server error (${res.status}): ${preview}`
            : "Server is unavailable. Please try again later."
          : text,
    });
  }
}

export async function request<T>(
  path: string,
  opts: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const url = `${API_V1}${path}`;
  const isFormData = opts.body instanceof FormData;
  const headers = isFormData ? authHeadersNoContentType() : authHeaders();

  const { timeoutMs, ...fetchOpts } = opts;
  const controller = new AbortController();
  const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
  // Merge caller-supplied signal with our timeout signal
  if (opts.signal) {
    opts.signal.addEventListener("abort", () => controller.abort());
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchOpts,
      headers: { ...headers, ...fetchOpts.headers },
      signal: controller.signal,
    });
  } catch (err) {
    if (timer) clearTimeout(timer);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError({
        code: "NETWORK_ERROR",
        message: "Request timed out — the server is taking too long to respond.",
      });
    }
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "Unable to reach the server. Check your connection.",
    });
  }
  if (timer) clearTimeout(timer);

  if (res.status === 429) {
    handleRateLimit(res);
    throw new ApiError({ code: "RATE_LIMITED", message: "Rate limited" });
  }

  if (res.status === 401) {
    const body = await parseJson<null>(res);
    if (body.error?.code === "TOKEN_EXPIRED") {
      await refreshAccessToken();
      const retryHeaders = isFormData ? authHeadersNoContentType() : authHeaders();
      const retry = await fetch(url, { ...opts, headers: { ...retryHeaders, ...opts.headers } });
      if (retry.status === 429) {
        handleRateLimit(retry);
        throw new ApiError({ code: "RATE_LIMITED", message: "Rate limited" });
      }
      const retryBody = await parseJson<T>(retry);
      if (retryBody.error) throw new ApiError(retryBody.error);
      return retryBody.data as T;
    }
    if (body.error) throw new ApiError(body.error);
    throw new Error("Unauthorized");
  }

  const body = await parseJson<T>(res);
  if (body.error) throw new ApiError(body.error);
  return body.data as T;
}

export function handleApiError(error: APIErrorType, navigate?: (path: string) => void): void {
  switch (error.code) {
    case "TOKEN_EXPIRED":
    case "RATE_LIMITED":
      break;
    case "SESSION_NOT_FOUND":
      navigate?.("/sessions");
      toast.error("Session not found");
      break;
    case "UNAUTHORIZED":
      clearTokens();
      navigate?.("/login");
      break;
    case "FORBIDDEN":
      toast.error("Access denied");
      break;
    case "NETWORK_ERROR":
      toast.error(error.message);
      break;
    case "NOT_IMPLEMENTED":
      toast.info("Feature not yet available");
      break;
    case "PROVIDER_UNREACHABLE":
      toast.error("LLM provider is offline. Check configuration.");
      break;
    case "MCP_RESTART_FAILED":
      toast.error("MCP server restart failed");
      break;
    case "MCP_SERVER_NOT_FOUND":
      toast.error("MCP server not found");
      break;
    case "CAMPAIGN_NOT_FOUND":
      toast.error("Campaign not found");
      break;
    case "CAMPAIGNS_NOT_AVAILABLE":
      toast.error("Campaign manager is not available");
      break;
    case "CAMPAIGN_NOT_LAUNCHABLE":
      toast.error("Campaign cannot be launched — it must be in draft or paused state");
      break;
    case "CONFLICT":
      toast.error(error.message);
      break;
    case "SERVICE_UNAVAILABLE":
      toast.error("Service unavailable — check assistant status");
      break;
    case "ASSISTANT_START_FAILED":
      toast.error(error.message || "Assistant failed to start");
      break;
    case "GONE":
      toast.error("This feature is no longer available");
      break;
    case "ASSISTANT_ALREADY_RUNNING":
      toast.error("Assistant is already running");
      break;
    case "ASSISTANT_NOT_RUNNING":
      toast.error("Assistant is not running");
      break;
    case "BAD_REQUEST":
      toast.error(error.message);
      break;
    case "MODEL_NOT_FOUND":
      toast.error("Model not found — check model alias in configuration");
      break;
    case "WIZARD_STEP_ERROR":
      toast.error(error.message || "Wizard step could not complete");
      break;
    case "CONFIG_INVALID":
      toast.error(error.message || "Configuration is invalid");
      break;
    case "INGEST_FAILED":
      toast.error("Document processing failed");
      break;
    case "MEMORY_CLEAR_FAILED":
      toast.error("Could not clear memory");
      break;
    case "TURN_IN_PROGRESS":
      toast.warning("Please wait for the current response to complete");
      break;
    case "INTERNAL_ERROR":
      toast.error("An unexpected error occurred");
      break;
    default:
      toast.error(error.message);
  }
}

export const api = {
  get: <T>(path: string, opts?: { timeoutMs?: number }) => request<T>(path, opts),
  post: <T>(path: string, data?: unknown, opts?: { timeoutMs?: number }) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined, ...opts }),
  put: <T>(path: string, data?: unknown, opts?: { timeoutMs?: number }) =>
    request<T>(path, { method: "PUT", body: data ? JSON.stringify(data) : undefined, ...opts }),
  patch: <T>(path: string, data?: unknown, opts?: { timeoutMs?: number }) =>
    request<T>(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined, ...opts }),
  delete: <T>(path: string, opts?: { timeoutMs?: number; body?: unknown }) =>
    request<T>(path, {
      method: "DELETE",
      ...(opts?.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
      ...(opts?.timeoutMs !== undefined ? { timeoutMs: opts.timeoutMs } : {}),
    }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
};
