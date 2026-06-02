"use client";

import { Gift, Copy, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DBUser } from "@/lib/database.types";

export default function ReferralsSettings() {
  const supabase = createClient();
  const [user, setUser] = useState<DBUser | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
      if (data) setUser(data);
    }
    fetchUser();
  }, [supabase]);

  // Generate a proper referral link
  const generateReferralCode = () => {
    if (user?.referral_code) return user.referral_code;
    if (user?.companion_name) return user.companion_name.toLowerCase().replace(/\s+/g, '');
    if (user?.full_name) return user.full_name.toLowerCase().replace(/\s+/g, '');
    return user?.id?.substring(0, 8) || "join";
  };

  const referralCode = generateReferralCode();
  const referralLink = `https://aegis.app/join/${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">Refer & Earn</h1>
        <p className="text-sm text-text-muted">Invite friends and earn free Elite months.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-medium text-text-primary mb-2">Give £10, Get £10</h2>
        <p className="text-sm text-text-muted mb-8 max-w-sm mx-auto">
          Share your unique link. When a friend signs up and settles their first BNPL bill, you both get £10 deposited into your Aegis Wallet.
        </p>

        <div className="flex items-center gap-2 bg-surface-hover border border-border p-2 rounded-xl max-w-md mx-auto">
          <div className="flex-1 overflow-x-auto no-scrollbar text-left px-3 text-sm font-mono text-text-secondary whitespace-nowrap">
            {referralLink}
          </div>
          <Button onClick={copyLink} size="sm" icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Your Referrals</h3>
        <div className="bg-surface border border-border rounded-xl p-8 text-center border-dashed">
          <p className="text-sm text-text-muted">You haven't referred anyone yet.</p>
        </div>
      </section>
    </div>
  );
}
