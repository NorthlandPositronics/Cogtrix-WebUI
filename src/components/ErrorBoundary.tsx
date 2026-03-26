import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/** Must be rendered inside a BrowserRouter — uses `<Link>` for client-side navigation to preserve in-memory JWT. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="size-6 text-red-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900">Something went wrong</h2>
          <p className="text-sm text-zinc-500">
            An unexpected error occurred while rendering this page.
          </p>
        </div>
        {import.meta.env.DEV && this.state.error && (
          <pre className="max-w-lg overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-left font-mono text-xs text-zinc-900">
            {this.state.error.stack ?? this.state.error.message}
          </pre>
        )}
        <div className="flex items-center gap-3">
          <Link
            to="/sessions"
            className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Go to Sessions
          </Link>
          <Button onClick={() => window.location.reload()} size="sm">
            Reload page
          </Button>
        </div>
      </div>
    );
  }
}

export function withErrorBoundary(children: ReactNode, fallback?: ReactNode): ReactNode {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}

export default ErrorBoundary;
