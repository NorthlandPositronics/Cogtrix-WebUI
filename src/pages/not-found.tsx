import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-4 text-center">
      <FileQuestion className="h-12 w-12 text-zinc-400" strokeWidth={1.5} aria-hidden="true" />
      <p className="text-3xl font-bold text-zinc-900">404</p>
      <div className="space-y-2">
        <h1 className="text-xl text-zinc-500">Page not found</h1>
        <p className="max-w-sm text-center text-sm text-zinc-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <p className="max-w-sm text-center text-sm text-zinc-500">
          Check the URL or return to the home page.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link to="/">Go home</Link>
      </Button>
    </main>
  );
}

export default NotFoundPage;
