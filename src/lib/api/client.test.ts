import { vi, type Mock } from "vitest";
import { setTokens, clearTokens } from "./tokens";
import { request, api } from "./client";
import { ApiError } from "./types/common";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() },
}));

const mockFetch = vi.fn() as Mock;

beforeAll(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  clearTokens();
  vi.clearAllMocks();
});

function jsonResponse<T>(data: T, status = 200): Response {
  const body = JSON.stringify({
    data,
    error: null,
    meta: { request_id: "test", timestamp: new Date().toISOString() },
  });
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
    headers: new Headers(),
  } as unknown as Response;
}

function errorResponse(code: string, message: string, status = 400): Response {
  const body = JSON.stringify({
    data: null,
    error: { code, message },
    meta: { request_id: "test", timestamp: new Date().toISOString() },
  });
  return {
    ok: false,
    status,
    text: () => Promise.resolve(body),
    headers: new Headers(),
  } as unknown as Response;
}

describe("request()", () => {
  it("makes a GET request and unwraps the data envelope", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: "123", name: "test" }));

    const result = await request<{ id: string; name: string }>("/sessions");

    expect(result).toEqual({ id: "123", name: "test" });
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("attaches Authorization header when token is set", async () => {
    setTokens({
      access_token: "my-token",
      refresh_token: "ref",
      token_type: "bearer",
      expires_in: 3600,
    });
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await request("/test");

    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.headers.Authorization).toBe("Bearer my-token");
  });

  it("throws ApiError on error response", async () => {
    mockFetch.mockResolvedValueOnce(errorResponse("SESSION_NOT_FOUND", "Session not found", 404));

    await expect(request("/sessions/bad")).rejects.toThrow(ApiError);

    mockFetch.mockResolvedValueOnce(errorResponse("SESSION_NOT_FOUND", "Session not found", 404));

    await expect(request("/sessions/bad")).rejects.toMatchObject({
      code: "SESSION_NOT_FOUND",
      message: "Session not found",
    });
  });

  it("handles 429 rate limiting", async () => {
    const { toast } = await import("sonner");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: new Headers({ "Retry-After": "5" }),
      text: () => Promise.resolve("{}"),
    } as unknown as Response);

    await expect(request("/test")).rejects.toThrow(ApiError);
    expect(toast.error).toHaveBeenCalledWith("Rate limited. Retry in 5 seconds.");
  });

  it("refreshes token on 401 TOKEN_EXPIRED and retries", async () => {
    setTokens({
      access_token: "expired",
      refresh_token: "valid-refresh",
      token_type: "bearer",
      expires_in: 3600,
    });

    // First call: 401 TOKEN_EXPIRED
    mockFetch.mockResolvedValueOnce(errorResponse("TOKEN_EXPIRED", "Token expired", 401));

    // Refresh call: success
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        access_token: "new-access",
        refresh_token: "new-refresh",
        token_type: "bearer",
        expires_in: 3600,
      }),
    );

    // Retry of original request: success
    mockFetch.mockResolvedValueOnce(jsonResponse({ result: "ok" }));

    const result = await request<{ result: string }>("/protected");

    expect(result).toEqual({ result: "ok" });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});

describe("api convenience methods", () => {
  it("api.get sends GET request", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([1, 2, 3]));

    const result = await api.get<number[]>("/items");

    expect(result).toEqual([1, 2, 3]);
    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.method).toBeUndefined();
  });

  it("api.post sends POST with JSON body", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: "new" }));

    await api.post("/sessions", { name: "test" });

    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.method).toBe("POST");
    expect(opts.body).toBe(JSON.stringify({ name: "test" }));
  });

  it("api.patch sends PATCH with JSON body", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: "updated" }));

    await api.patch("/sessions/1", { name: "renamed" });

    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.method).toBe("PATCH");
  });

  it("api.delete sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(null));

    await api.delete("/sessions/1");

    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.method).toBe("DELETE");
  });
});
