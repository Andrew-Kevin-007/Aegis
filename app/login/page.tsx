"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast, Toaster } from "sonner";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const authError = searchParams.get("error");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${next}`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to send magic link.");
    } else {
      setSent(true);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-8">

      <Link href="/" className="flex items-center gap-2 text-text-muted text-xs font-mono uppercase tracking-widest hover:text-text-primary transition-colors self-start">
        <ArrowLeft className="w-3 h-3" /> Home
      </Link>

      <div className="text-center">
        <span className="font-bold tracking-tighter text-xl">Aegis.</span>

        {!sent ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight mt-6">Protect Your Credit Score</h1>
            <p className="text-text-secondary text-sm mt-2">
              Enter your email. No password needed.
            </p>
          </>
        ) : (
          <>
            <div className="mt-6 flex justify-center">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mt-4">Check Your Inbox</h1>
            <p className="text-text-secondary text-sm mt-2">
              We sent a magic link to <span className="text-text-primary font-medium">{email}</span>.
              Click the link to sign in.
            </p>
          </>
        )}
      </div>

      {authError && (
        <div className="border border-danger/30 bg-danger/5 rounded-xl p-4 text-sm text-danger">
          Authentication failed. Please try again.
        </div>
      )}

      {!sent ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Button type="submit" isLoading={loading} fullWidth icon={<ArrowRight className="w-4 h-4" />}>
            Send Magic Link
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <Button variant="secondary" fullWidth onClick={() => setSent(false)}>
            Use a Different Email
          </Button>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary flex items-center justify-center px-6">
      <Toaster theme="dark" closeButton />
      <Suspense fallback={
        <div className="text-text-muted font-mono text-xs">Loading...</div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
