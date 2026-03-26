import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ApiError } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarLogo } from "@/components/SidebarLogo";

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
}

interface FieldError {
  code: string;
  message: string;
}

function extractFieldErrors(err: unknown): { general: string; fields: FieldErrors } {
  if (!(err instanceof ApiError)) {
    return {
      general: err instanceof Error ? err.message : "Authentication failed",
      fields: {},
    };
  }

  const fields: FieldErrors = {};
  const knownFields = ["username", "email", "password"] as const;

  const fieldMap = err.details?.fields;
  if (fieldMap && typeof fieldMap === "object") {
    for (const name of knownFields) {
      const errs = (fieldMap as Record<string, FieldError[]>)[name];
      if (Array.isArray(errs) && errs.length > 0) {
        fields[name] = errs[0]?.message ?? "";
      }
    }
    if (Object.keys(fields).length > 0) {
      return { general: "", fields };
    }
  }

  return { general: err.message, fields };
}

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    try {
      await login(username, password);
      navigate("/sessions");
    } catch (err) {
      const { general, fields } = extractFieldErrors(err);
      setGeneralError(general);
      setFieldErrors(fields);
    }
  }

  return (
    <>
      {generalError && (
        <Alert data-cy="auth-error" className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-700" />
          <AlertDescription className="text-red-700">{generalError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-sm font-medium text-zinc-900">
            Username or email
          </Label>
          <Input
            id="username"
            type="text"
            autoComplete="username email"
            placeholder="username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
            aria-invalid={!!fieldErrors.username}
            className={fieldErrors.username ? "border-red-600" : ""}
          />
          {fieldErrors.username && <p className="text-sm text-red-600">{fieldErrors.username}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-zinc-900">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            aria-invalid={!!fieldErrors.password}
            className={fieldErrors.password ? "border-red-600" : ""}
          />
          {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}
        </div>

        <Button type="submit" size="lg" disabled={isLoading} className="mt-6 w-full">
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-500">
        {"Don't have an account? "}
        <Link
          to="/register"
          className="text-teal-600 underline-offset-4 hover:text-teal-700 hover:underline"
        >
          Register
        </Link>
      </p>
    </>
  );
}

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter.";
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one digit.";
    if (!/[^a-zA-Z0-9]/.test(pw)) return "Password must contain at least one special character.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const pwError = validatePassword(password);
    if (pwError) {
      setFieldErrors({ password: pwError });
      return;
    }

    try {
      await register(username, email, password);
      navigate("/sessions");
    } catch (err) {
      const { general, fields } = extractFieldErrors(err);
      setGeneralError(general);
      setFieldErrors(fields);
    }
  }

  return (
    <>
      {generalError && (
        <Alert data-cy="auth-error" className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-700" />
          <AlertDescription className="text-red-700">{generalError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-sm font-medium text-zinc-900">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
            minLength={3}
            maxLength={64}
            pattern="[a-zA-Z0-9_\-]+"
            aria-invalid={!!fieldErrors.username}
            aria-describedby="username-hint"
            className={fieldErrors.username ? "border-red-600" : ""}
          />
          <p id="username-hint" className="text-xs text-zinc-500">
            3–64 characters: letters, digits, hyphens, underscores
          </p>
          {fieldErrors.username && <p className="text-sm text-red-600">{fieldErrors.username}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-zinc-900">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            aria-invalid={!!fieldErrors.email}
            className={fieldErrors.email ? "border-red-600" : ""}
          />
          {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-zinc-900">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            minLength={8}
            maxLength={128}
            aria-invalid={!!fieldErrors.password}
            aria-describedby="password-hint"
            className={fieldErrors.password ? "border-red-600" : ""}
          />
          <p id="password-hint" className="text-xs text-zinc-500">
            8–128 characters, with uppercase, lowercase, digit, and special character
          </p>
          {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}
        </div>

        <Button type="submit" size="lg" disabled={isLoading} className="mt-6 w-full">
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-500">
        {"Already have an account? "}
        <Link
          to="/login"
          className="text-teal-600 underline-offset-4 hover:text-teal-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}

export function LoginPage() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="mx-4 w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <SidebarLogo className="mb-3 h-10 w-10" />
          <h1 className="text-3xl leading-tight font-bold text-zinc-900">Cogtrix</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isRegister ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {isRegister ? <RegisterForm /> : <LoginForm />}
      </div>
    </div>
  );
}

export default LoginPage;
