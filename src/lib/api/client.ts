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
    // Non-JSON body — surface the real content, tag-stripped and truncated.
    // A reverse proxy can emit an HTML page below 500 too (e.g. nginx 413 when
    // an upload exceeds client_max_body_size), so the preview must be used on
    // both branches; passing raw `text` through put a whole HTML document in a
    // toast.
    const preview = text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: preview
        ? `Server error (${res.status}): ${preview}`
        : "Server is unavailable. Please try again later.",
    });
  }
}

export async function request<T>(
  path: string,
  opts: RequestInit & { timeoutMs?: number } = {},
  // Internal: set on the single retry after a token refresh so a repeat 401
  // can't trigger an endless refresh→retry loop.
  alreadyRefreshed = false,
): Promise<T> {
  const url = `${API_V1}${path}`;
  const isFormData = opts.body instanceof FormData;
  const headers = isFormData ? authHeadersNoContentType() : authHeaders();

  const { timeoutMs, ...fetchOpts } = opts;
  const controller = new AbortController();
  let timedOut = false;
  const timer = timeoutMs
    ? setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs)
    : null;
  // Merge caller-supplied signal with our timeout signal. An already-aborted
  // signal never fires the listener, so honour it up front instead of issuing a
  // request the caller has already cancelled.
  if (opts.signal) {
    if (opts.signal.aborted) {
      if (timer) clearTimeout(timer);
      throw new ApiError({ code: "NETWORK_ERROR", message: "Request was cancelled." });
    }
    opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
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
        message: timedOut
          ? "Request timed out — the server is taking too long to respond."
          : "Request was cancelled.",
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
    if (body.error?.code === "TOKEN_EXPIRED" && !alreadyRefreshed) {
      await refreshAccessToken();
      // Retry once through the full request path so the retry gets its own
      // timeout, abort handling, rate-limit/204 checks, and envelope parsing —
      // rather than a hand-rolled fetch that silently drops the timeout.
      return request<T>(path, opts, true);
    }
    if (body.error) throw new ApiError(body.error);
    throw new Error("Unauthorized");
  }

  // 204 No Content (e.g. DELETE /mcp/servers/{name}) has an empty body — no
  // envelope to parse. Return undefined rather than choking parseJson on "".
  if (res.status === 204) return undefined as T;

  const body = await parseJson<T>(res);
  if (body.error) throw new ApiError(body.error);
  // Only 429/401/204 are checked above; every other non-2xx used to fall through
  // as a successful `undefined` whenever the body lacked an `error` key. That
  // happens for any response that doesn't reach the envelope-wrapping handler —
  // FastAPI emits `{"detail": ...}` for unmatched routes (404), wrong verbs (405)
  // and request validation (422) — so a 404 was indistinguishable from an empty
  // result, and destructive mutations reported success without doing anything.
  if (!res.ok) {
    const detail = (body as unknown as { detail?: unknown }).detail;
    throw new ApiError({
      code: `HTTP_${res.status}`,
      message:
        typeof detail === "string" && detail
          ? detail
          : res.statusText || `Request failed (${res.status})`,
    });
  }
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
