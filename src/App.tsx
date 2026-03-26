import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./lib/stores/auth-store";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageSkeleton } from "./components/PageSkeleton";
import { AppShell } from "./pages/layout/AppShell";

const LoginPage = lazy(() => import("./pages/login").then((m) => ({ default: m.LoginPage })));
const SessionsPage = lazy(() =>
  import("./pages/sessions").then((m) => ({ default: m.SessionsPage })),
);
const SessionPage = lazy(() => import("./pages/session").then((m) => ({ default: m.SessionPage })));
const SettingsPage = lazy(() =>
  import("./pages/settings").then((m) => ({ default: m.SettingsPage })),
);
const AdminPage = lazy(() => import("./pages/admin").then((m) => ({ default: m.AdminPage })));
const AssistantPage = lazy(() =>
  import("./pages/assistant").then((m) => ({ default: m.AssistantPage })),
);
const DocumentsPage = lazy(() =>
  import("./pages/documents").then((m) => ({ default: m.DocumentsPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/not-found").then((m) => ({ default: m.NotFoundPage })),
);

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminRoute() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAdmin) return <Navigate to="/sessions" replace />;
  return <Outlet />;
}

function suspense(element: ReactNode) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Unauthenticated routes — no shell */}
        <Route path="/login" element={suspense(<LoginPage />)} />
        <Route path="/register" element={suspense(<LoginPage />)} />

        {/* Authenticated routes — wrapped in AppShell via ProtectedRoute → AppShell layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={suspense(<AppShell />)}>
            <Route path="/sessions" element={suspense(<SessionsPage />)} />
            <Route path="/sessions/:id" element={suspense(<SessionPage />)} />
            <Route path="/settings" element={suspense(<SettingsPage />)} />
            <Route path="/assistant" element={suspense(<AssistantPage />)} />
            <Route path="/documents" element={suspense(<DocumentsPage />)} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={suspense(<AdminPage />)} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/sessions" replace />} />
        <Route path="*" element={suspense(<NotFoundPage />)} />
      </Routes>
    </ErrorBoundary>
  );
}
