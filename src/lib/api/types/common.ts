export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
}

export interface ResponseMeta {
  request_id: string;
  timestamp: string;
}

export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
  meta: ResponseMeta;
}

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
  total: number | null;
}

export class ApiError extends Error {
  code: string;
  details?: Record<string, unknown> | null;

  constructor(error: APIError) {
    super(error.message);
    this.name = "ApiError";
    this.code = error.code;
    this.details = error.details;
  }

  /**
   * Extract field-level validation errors when code is VALIDATION_ERROR.
   *
   * The backend nests errors for nested models — `config.max_steps` arrives as
   * `{ config: { max_steps: [...] } }`. Those are flattened to dotted keys
   * ("config.max_steps"); a non-recursive read would drop them silently.
   */
  getFieldErrors(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    const fields = (this.details as ValidationDetails | null)?.fields;
    if (!fields) return result;

    const walk = (node: unknown, path: string): void => {
      if (Array.isArray(node)) {
        result[path] = (node as FieldError[]).map((e) => e.message);
        return;
      }
      if (node && typeof node === "object") {
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
          walk(value, path ? `${path}.${key}` : key);
        }
      }
    };
    walk(fields, "");
    return result;
  }
}

export type ValidationCode =
  | "TOO_SHORT"
  | "TOO_LONG"
  | "INVALID_FORMAT"
  | "INVALID_VALUE"
  | "REQUIRED"
  | "OUT_OF_RANGE"
  | "INVALID_CHOICE"
  | "INVALID_JSON"
  | "TYPE_MISMATCH"
  | "INVALID";

export interface FieldError {
  code: ValidationCode;
  message: string;
}

export interface ValidationDetails {
  fields: Record<string, FieldError[] | Record<string, FieldError[]>>;
}
