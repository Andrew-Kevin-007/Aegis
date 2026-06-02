"use client";

import { Lock, CheckCircle, AlertTriangle, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DBUser } from "@/lib/database.types";

export default function SecuritySettings() {
  const supabase = createClient();
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
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">Security & Privacy</h1>
        <p className="text-sm text-text-muted">Manage your data encryption and active sessions.</p>
      </div>

      <section>
        <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Security Audit</h2>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-success" />
              <span className="text-sm text-text-primary">Database Encryption (AES-256)</span>
            </div>
            <span className="text-xs text-success font-mono uppercase">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm text-text-primary">Edge Rate Limiting</span>
            </div>
            <span className="text-xs text-success font-mono uppercase">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tier === "elite" ? <CheckCircle className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
              <span className="text-sm text-text-primary">Priority SMS Alerts</span>
            </div>
            <span className={`text-xs font-mono uppercase ${tier === "elite" ? "text-success" : "text-warning"}`}>
              {tier === "elite" ? "Active" : "Locked"}
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted">Active Sessions</h2>
          <button onClick={() => toast.info("Revoking other sessions...")} className="text-[10px] text-text-muted hover:text-danger font-mono uppercase transition-colors">
            Revoke All
          </button>
        </div>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary flex items-center gap-2">MacBook Pro 16" <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /></p>
              <p className="text-[10px] text-text-muted font-mono mt-1">Chrome · San Francisco, CA (Current)</p>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between opacity-60">
            <div>
              <p className="text-sm font-medium text-text-primary">iPhone 15 Pro</p>
              <p className="text-[10px] text-text-muted font-mono mt-1">Aegis App · New York, NY (2 hrs ago)</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Data & Privacy (GDPR)</h2>
        <div className="space-y-3">
          <button
            onClick={() => toast.info("Exporting data...")}
            className="w-full flex items-center justify-between bg-surface border border-border hover:border-text-muted rounded-xl p-4 transition-colors"
          >
            <div className="flex items-center gap-3 text-sm text-text-primary">
              <Download className="w-4 h-4 text-text-muted" />
              <span>Export My Encrypted Data</span>
            </div>
          </button>
          <button
            onClick={() => toast.error("Account deleted (Mock)")}
            className="w-full flex items-center justify-between bg-surface border border-border hover:border-danger/30 rounded-xl p-4 transition-colors group"
          >
            <div className="flex items-center gap-3 text-sm text-text-primary group-hover:text-danger transition-colors">
              <Trash2 className="w-4 h-4 text-text-muted group-hover:text-danger" />
              <span>Nuke Account & Data</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
