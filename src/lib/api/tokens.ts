import type { TokenPair } from "./types/auth";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(pair: TokenPair): void {
  accessToken = pair.access_token;
  refreshToken = pair.refresh_token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
}
