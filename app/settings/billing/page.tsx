"use client";

import { Sparkles, Shield, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DBUser } from "@/lib/database.types";
import { useRouter } from "next/navigation";

export default function BillingSettings() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<DBUser | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
      if (data) setUser(data);
    }
    fetchUser();
  }, [supabase]);

  const tier = user?.tier || "free";

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">Billing</h1>
        <p className="text-sm text-text-muted">Manage your subscription and payment methods.</p>
      </div>

      <div className={`border rounded-2xl p-6 flex items-center justify-between ${tier === "elite" ? "bg-gold/5 border-gold/30" : tier === "pro" ? "bg-surface border-border" : "bg-surface border-border"}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${tier === "elite" ? "bg-gold/10" : "bg-surface-hover"}`}>
            {tier === "elite" ? <Sparkles className="w-6 h-6 text-gold" /> : tier === "pro" ? <Zap className="w-6 h-6 text-warning" /> : <Shield className="w-6 h-6 text-text-muted" />}
          </div>
          <div>
            <p className={`text-lg font-medium ${tier === "elite" ? "text-gold" : "text-text-primary"}`}>
              {tier === "elite" ? "Aegis Elite" : tier === "pro" ? "Aegis Pro" : "Free Plan"}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {tier === "free" ? "Basic tracking. No automation." : "You are fully protected."}
            </p>
          </div>
        </div>
        {tier !== "elite" && (
          <Button onClick={() => router.push("/upgrade")} className="font-mono uppercase tracking-widest text-xs">
            Upgrade
          </Button>
        )}
      </div>

      <section>
        <button
          onClick={() => toast.info("Redirecting to Stripe Billing Portal...")}
          className="w-full flex items-center justify-center gap-2 bg-surface border border-border hover:border-text-muted rounded-xl p-4 transition-colors text-sm font-mono uppercase tracking-widest text-text-primary"
        >
          Manage Billing & Subscriptions
        </button>
      </section>
    </div>
  );
}
