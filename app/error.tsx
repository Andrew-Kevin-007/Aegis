"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-text-primary flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-6" />
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Something went wrong</h1>
        <p className="text-text-secondary text-sm mb-8">
          An unexpected error occurred. This has been logged.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </main>
  );
}
