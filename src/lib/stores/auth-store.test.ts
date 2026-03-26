import { vi, type Mock } from "vitest";
import { useAuthStore } from "./auth-store";
import { clearTokens, getAccessToken, getRefreshToken } from "../api/tokens";
import { act } from "@testing-library/react";

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

function getStore() {
  return useAuthStore.getState();
}

function resetStore() {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
  });
  clearTokens();
}

function apiResponse<T>(data: T) {
  const body = JSON.stringify({
    data,
    error: null,
    meta: { request_id: "test", timestamp: new Date().toISOString() },
  });
  return {
    ok: true,
    status: 200,
    text: () => Promise.resolve(body),
    headers: new Headers(),
  } as unknown as Response;
}

function apiError(code: string, message: string, status = 400) {
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

describe("auth store", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it("starts unauthenticated", () => {
    expect(getStore().isAuthenticated).toBe(false);
    expect(getStore().user).toBeNull();
    expect(getStore().isAdmin).toBe(false);
  });

  it("login stores tokens and fetches profile", async () => {
    mockFetch
      .mockResolvedValueOnce(
        apiResponse({
          access_token: "acc",
          refresh_token: "ref",
          token_type: "bearer",
          expires_in: 3600,
        }),
      )
      .mockResolvedValueOnce(
        apiResponse({
          id: "u1",
          username: "testuser",
          email: "test@example.com",
          role: "user",
          created_at: "2026-01-01T00:00:00Z",
        }),
      );

    await act(async () => {
      await getStore().login("testuser", "password123");
    });

    expect(getStore().isAuthenticated).toBe(true);
    expect(getStore().user?.username).toBe("testuser");
    expect(getStore().isAdmin).toBe(false);
    expect(getAccessToken()).toBe("acc");
    expect(getRefreshToken()).toBe("ref");
  });

  it("login sets isAdmin for admin users", async () => {
    mockFetch
      .mockResolvedValueOnce(
        apiResponse({
          access_token: "acc",
          refresh_token: "ref",
          token_type: "bearer",
          expires_in: 3600,
        }),
      )
      .mockResolvedValueOnce(
        apiResponse({
          id: "a1",
          username: "admin",
          email: "admin@example.com",
          role: "admin",
          created_at: "2026-01-01T00:00:00Z",
        }),
      );

    await act(async () => {
      await getStore().login("admin", "password");
    });

    expect(getStore().isAdmin).toBe(true);
  });

  it("register stores tokens and fetches profile", async () => {
    mockFetch
      .mockResolvedValueOnce(
        apiResponse({
          access_token: "new-acc",
          refresh_token: "new-ref",
          token_type: "bearer",
          expires_in: 3600,
        }),
      )
      .mockResolvedValueOnce(
        apiResponse({
          id: "u2",
          username: "newuser",
          email: "new@example.com",
          role: "user",
          created_at: "2026-01-01T00:00:00Z",
        }),
      );

    await act(async () => {
      await getStore().register("newuser", "new@example.com", "password123");
    });

    expect(getStore().isAuthenticated).toBe(true);
    expect(getStore().user?.username).toBe("newuser");
    expect(getAccessToken()).toBe("new-acc");
  });

  it("logout clears state and tokens", async () => {
    // Set up authenticated state
    mockFetch
      .mockResolvedValueOnce(
        apiResponse({
          access_token: "acc",
          refresh_token: "ref",
          token_type: "bearer",
          expires_in: 3600,
        }),
      )
      .mockResolvedValueOnce(
        apiResponse({
          id: "u1",
          username: "testuser",
          email: "test@example.com",
          role: "user",
          created_at: "2026-01-01T00:00:00Z",
        }),
      );

    await act(async () => {
      await getStore().login("testuser", "password123");
    });

    // Logout
    mockFetch.mockResolvedValueOnce(apiResponse(null));

    await act(async () => {
      await getStore().logout();
    });

    expect(getStore().isAuthenticated).toBe(false);
    expect(getStore().user).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("logout clears state even if API call fails", async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: "u1" } as never });

    mockFetch.mockResolvedValueOnce(apiError("INTERNAL_ERROR", "Server error", 500));

    await act(async () => {
      try {
        await getStore().logout();
      } catch {
        // The ApiError propagates, but finally block should still clear state
      }
    });

    expect(getStore().isAuthenticated).toBe(false);
    expect(getStore().user).toBeNull();
  });

  it("resets isLoading after login completes", async () => {
    mockFetch
      .mockResolvedValueOnce(
        apiResponse({
          access_token: "acc",
          refresh_token: "ref",
          token_type: "bearer",
          expires_in: 3600,
        }),
      )
      .mockResolvedValueOnce(
        apiResponse({
          id: "u1",
          username: "user",
          email: "user@example.com",
          role: "user",
          created_at: "2026-01-01T00:00:00Z",
        }),
      );

    await act(async () => {
      await getStore().login("user", "pass");
    });

    expect(getStore().isLoading).toBe(false);
  });
});
