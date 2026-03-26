export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}

export interface UserUpdateRequest {
  role?: "user" | "admin" | null;
}
