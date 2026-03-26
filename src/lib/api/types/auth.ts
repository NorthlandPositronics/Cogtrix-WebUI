export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UserOut {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

export interface APIKeyCreateRequest {
  label: string;
  expires_in_days?: number | null;
}

export interface APIKeyOut {
  id: string;
  label: string;
  key: string | null;
  key_prefix: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}
