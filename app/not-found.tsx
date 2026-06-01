import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-text-primary flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="font-mono text-6xl text-text-muted mb-6">404</p>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Page not found</h1>
        <p className="text-text-secondary text-sm mb-8">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>Back to Home</Button>
        </Link>
      </div>
    </main>
  );
}
