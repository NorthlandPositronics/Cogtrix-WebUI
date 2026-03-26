import { setTokens, getAccessToken, getRefreshToken, clearTokens } from "./tokens";

describe("token storage", () => {
  afterEach(() => {
    clearTokens();
  });

  it("stores and retrieves tokens", () => {
    setTokens({
      access_token: "acc",
      refresh_token: "ref",
      token_type: "bearer",
      expires_in: 3600,
    });

    expect(getAccessToken()).toBe("acc");
    expect(getRefreshToken()).toBe("ref");
  });

  it("returns null when no tokens are stored", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("clears tokens", () => {
    setTokens({
      access_token: "acc",
      refresh_token: "ref",
      token_type: "bearer",
      expires_in: 3600,
    });

    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("overwrites tokens on subsequent calls", () => {
    setTokens({
      access_token: "first",
      refresh_token: "first-ref",
      token_type: "bearer",
      expires_in: 3600,
    });

    setTokens({
      access_token: "second",
      refresh_token: "second-ref",
      token_type: "bearer",
      expires_in: 7200,
    });

    expect(getAccessToken()).toBe("second");
    expect(getRefreshToken()).toBe("second-ref");
  });
});
