/**
 * Integration tests against the live Cogtrix backend at localhost:8000.
 *
 * These tests exercise real HTTP requests -- no mocking. They validate the
 * WebUI's API client and type contracts against the actual backend.
 *
 * Run with: pnpm test -- src/test/integration/
 *
 * Requires a running backend at http://localhost:8000. Tests create and clean
 * up their own test data (a unique user per run).
 */

const API = "http://localhost:8000/api/v1";

interface APIResponse<T> {
  data: T | null;
  error: { code: string; message: string; details?: Record<string, unknown> | null } | null;
  meta: { request_id: string; timestamp: string };
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface UserOut {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface SessionOut {
  id: string;
  name: string;
  owner_id: string;
  state: string;
  config: Record<string, unknown>;
  token_counts: { input_tokens: number; output_tokens: number; context_window: number };
  active_tools: string[];
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

async function apiRequest<T>(
  path: string,
  opts: RequestInit & { token?: string } = {},
): Promise<{ res: Response; body: APIResponse<T> }> {
  const { token, ...fetchOpts } = opts;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API}${path}`, { ...fetchOpts, headers });
  const body = (await res.json()) as APIResponse<T>;
  return { res, body };
}

const TEST_ID = Math.random().toString(36).slice(2, 10);
const TEST_USER = `testui_${TEST_ID}`;
const TEST_EMAIL = `testui_${TEST_ID}@example.com`;
const TEST_PASSWORD = "TestPassword123!";

let accessToken = "";
let refreshTokenValue = "";

describe("Backend integration tests", () => {
  describe("Health check", () => {
    it("backend is reachable at /api/v1/config", async () => {
      // Use a known endpoint to verify backend is up
      const res = await fetch(`${API}/config/providers`);
      // Even without auth, backend should respond (401 is fine — it means it's up)
      expect([200, 401, 403].includes(res.status)).toBe(true);
    });
  });

  describe("Auth: Registration & Login", () => {
    it("registers a new user", async () => {
      const { body } = await apiRequest<TokenPair>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: TEST_USER,
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.access_token).toBeTruthy();
      expect(body.data!.refresh_token).toBeTruthy();
      expect(body.data!.token_type).toBe("bearer");
      expect(body.data!.expires_in).toBeGreaterThan(0);

      accessToken = body.data!.access_token;
      refreshTokenValue = body.data!.refresh_token;
    });

    it("rejects duplicate registration", async () => {
      const { body } = await apiRequest<TokenPair>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: TEST_USER,
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      });

      expect(body.error).not.toBeNull();
      expect(body.data).toBeNull();
    });

    it("rejects registration with invalid username", async () => {
      const { body } = await apiRequest<TokenPair>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: "a",
          email: "short@example.com",
          password: TEST_PASSWORD,
        }),
      });

      expect(body.error).not.toBeNull();
    });

    it("fetches current user profile", async () => {
      const { body } = await apiRequest<UserOut>("/auth/me", { token: accessToken });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.username).toBe(TEST_USER);
      expect(body.data!.email).toBe(TEST_EMAIL);
      expect(body.data!.role).toBe("user");
      expect(body.data!.id).toBeTruthy();
    });

    it("refreshes access token", async () => {
      const { body } = await apiRequest<TokenPair>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.access_token).toBeTruthy();

      accessToken = body.data!.access_token;
      refreshTokenValue = body.data!.refresh_token;
    });

    it("logs in with correct credentials", async () => {
      const { body } = await apiRequest<TokenPair>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: TEST_USER, password: TEST_PASSWORD }),
      });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.access_token).toBeTruthy();

      accessToken = body.data!.access_token;
      refreshTokenValue = body.data!.refresh_token;
    });

    it("rejects login with wrong password", async () => {
      const { body } = await apiRequest<TokenPair>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: TEST_USER, password: "WrongPassword!" }),
      });

      expect(body.error).not.toBeNull();
    });

    it("rejects requests without auth token", async () => {
      const { body } = await apiRequest<UserOut>("/auth/me");

      expect(body.error).not.toBeNull();
    });
  });

  describe("Sessions", () => {
    let sessionId = "";

    it("creates a session", async () => {
      const { body } = await apiRequest<SessionOut>("/sessions", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ name: `Test Session ${TEST_ID}` }),
      });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.name).toBe(`Test Session ${TEST_ID}`);
      expect(body.data!.id).toBeTruthy();
      expect(body.data!.state).toBeDefined();

      sessionId = body.data!.id;
    });

    it("lists sessions", async () => {
      const { body } = await apiRequest<{
        items: SessionOut[];
        next_cursor: string | null;
        has_more: boolean;
        total: number | null;
      }>("/sessions", { token: accessToken });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(Array.isArray(body.data!.items)).toBe(true);
      expect(body.data!.items.length).toBeGreaterThanOrEqual(1);
      expect(body.data!.has_more).toBeDefined();
    });

    it("gets session by id", async () => {
      expect(sessionId).toBeTruthy();

      const { body } = await apiRequest<SessionOut>(`/sessions/${sessionId}`, {
        token: accessToken,
      });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.id).toBe(sessionId);
    });

    it("updates session name", async () => {
      expect(sessionId).toBeTruthy();

      const { body } = await apiRequest<SessionOut>(`/sessions/${sessionId}`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({ name: "Renamed Session" }),
      });

      expect(body.error).toBeNull();
      expect(body.data!.name).toBe("Renamed Session");
    });

    it("returns error for non-existent session", async () => {
      const { body } = await apiRequest<SessionOut>(
        "/sessions/00000000-0000-0000-0000-000000000000",
        { token: accessToken },
      );

      expect(body.error).not.toBeNull();
    });

    it("deletes session", async () => {
      expect(sessionId).toBeTruthy();

      const { res } = await apiRequest<null>(`/sessions/${sessionId}`, {
        method: "DELETE",
        token: accessToken,
      });

      // Accept 200 or 204
      expect(res.status).toBeLessThan(300);
    });
  });

  describe("Providers & Models", () => {
    it("lists providers", async () => {
      const { body } = await apiRequest<{ name: string }[]>("/config/providers", {
        token: accessToken,
      });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(Array.isArray(body.data)).toBe(true);
    });

    it("lists models", async () => {
      const { body } = await apiRequest<{ alias: string }[]>("/config/models", {
        token: accessToken,
      });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe("Config", () => {
    it("gets current config", async () => {
      const { body } = await apiRequest<Record<string, unknown>>("/config", {
        token: accessToken,
      });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
    });
  });

  describe("Tools", () => {
    it("lists tool catalog", async () => {
      const { body } = await apiRequest<unknown>("/tools", { token: accessToken });

      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      // Could be an array or a paginated object
      if (Array.isArray(body.data)) {
        expect(body.data.length).toBeGreaterThanOrEqual(0);
      } else {
        // Paginated: { items: [...] }
        expect(body.data).toHaveProperty("items");
      }
    });
  });

  describe("API response envelope", () => {
    it("always has meta with request_id and timestamp", async () => {
      const { body } = await apiRequest<UserOut>("/auth/me", { token: accessToken });

      expect(body.meta).toBeDefined();
      expect(body.meta.request_id).toBeTruthy();
      expect(body.meta.timestamp).toBeTruthy();
      expect(new Date(body.meta.timestamp).getTime()).not.toBeNaN();
    });

    it("error responses include code and message", async () => {
      const { body } = await apiRequest<null>("/sessions/not-a-uuid", {
        token: accessToken,
      });

      expect(body.error).not.toBeNull();
      expect(body.error!.code).toBeTruthy();
      expect(body.error!.message).toBeTruthy();
    });
  });

  describe("Validation error format", () => {
    it("returns field-level errors for invalid registration", async () => {
      const { body } = await apiRequest<null>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: "ab",
          email: "not-an-email",
          password: "short",
        }),
      });

      expect(body.error).not.toBeNull();
      expect(body.error!.code).toBeTruthy();

      // The backend should return validation details
      if (body.error!.details) {
        const fields = body.error!.details.fields;
        if (fields && typeof fields === "object") {
          // At least one field should have errors
          expect(Object.keys(fields).length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Cleanup: Logout", () => {
    it("logs out", async () => {
      const { body } = await apiRequest<null>("/auth/logout", {
        method: "POST",
        token: accessToken,
      });

      expect(body.error).toBeNull();
    });
  });
});
