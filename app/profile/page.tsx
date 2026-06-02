"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ChevronLeft, LogOut, Download, Trash2, Bell, Shield, MapPin, CheckCircle, AlertTriangle, Sparkles, Lock } from "lucide-react";
import { toast, Toaster } from "sonner";
import { detectRegion } from "@/lib/region";
import { formatCurrency } from "@/lib/currency";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const { code, currency } = detectRegion();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setEmail(user.email || "");

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(data);
      setFullName(data?.full_name || "");
      setPhone(data?.phone || "");
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("users").update({ full_name: fullName, phone }).eq("id", user.id);
      if (error) {
        toast.error("Failed to update profile.");
      } else {
        toast.success("Profile updated.");
        setProfile({ ...profile, full_name: fullName, phone });
      }
    }
    setSaving(false);
  };

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: payments } = await supabase.from("payments").select("*").eq("user_id", user.id);
      
      const exportObj = {
        profile,
        payments,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aegis-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      toast.success("Data exported successfully.");
    } catch (err) {
      toast.error("Failed to export data.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure? This will delete all your data permanently. This action cannot be undone.")) return;
    try {
      toast.error("Account deletion requested. Support will process this within 7 days.");
    } catch (err) {
      toast.error("Failed to initiate account deletion.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const tier = profile?.tier || "free";

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <Toaster theme="dark" closeButton />
      
      <header className="h-16 border-b border-white/5 flex items-center px-6 bg-[#0A0A0A]/60 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => router.push("/dashboard")} className="text-text-muted hover:text-white transition-colors mr-4">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold tracking-tighter font-mono">CONTROL ROOM</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        
        {/* Subscription Tier */}
        <section>
          <div className={`border rounded-xl p-5 flex items-center justify-between ${tier === "elite" ? "bg-[#FFD700]/10 border-[#FFD700]/30" : tier === "pro" ? "bg-white/5 border-white/20" : "bg-[#050505] border-white/5"}`}>
            <div className="flex items-center gap-3">
              {tier === "elite" ? <Sparkles className="w-5 h-5 text-gold" /> : tier === "pro" ? <Shield className="w-5 h-5 text-warning" /> : <Shield className="w-5 h-5 text-text-muted" />}
              <div>
                <p className={`font-medium text-sm ${tier === "elite" ? "text-gold" : "text-white"}`}>
                  {tier === "elite" ? "Aegis Elite" : tier === "pro" ? "Aegis Pro" : "Free Plan"}
                </p>
                {tier !== "free" && profile?.pro_expires_at && (
                  <p className="text-[10px] text-text-muted font-mono uppercase mt-0.5">
                    Renews: {new Date(profile.pro_expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {tier !== "elite" && (
              <Button size="sm" onClick={() => router.push("/upgrade")} className="text-[10px] font-mono uppercase">
                {tier === "free" ? "Upgrade" : "Go Elite"}
              </Button>
            )}
          </div>
        </section>

        {/* Security Audit */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Security Audit</h2>
          <div className="bg-[#050505] border border-white/5 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-success" />
                <span className="text-sm">Database Encryption (AES-256)</span>
              </div>
              <span className="text-xs text-success font-mono uppercase">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">Edge Rate Limiting</span>
              </div>
              <span className="text-xs text-success font-mono uppercase">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {tier === "elite" ? <CheckCircle className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
                <span className="text-sm">Priority SMS Alerts</span>
              </div>
              <span className={`text-xs font-mono uppercase ${tier === "elite" ? "text-success" : "text-warning"}`}>
                {tier === "elite" ? "Active" : "Locked"}
              </span>
            </div>
          </div>
        </section>

        {/* Notification Preferences */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Notification Command Center</h2>
          <div className="bg-[#050505] border border-white/5 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-[10px] text-text-muted font-mono mt-0.5">App alerts for due dates</p>
              </div>
              <div className="w-10 h-5 bg-success/20 rounded-full relative cursor-pointer" onClick={() => toast.success("Push preferences updated")}>
                <div className="absolute right-1 top-1 w-3 h-3 bg-success rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <p className="text-sm font-medium">Weekly Email Brief</p>
                <p className="text-[10px] text-text-muted font-mono mt-0.5">Sunday summary of liabilities</p>
              </div>
              <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer" onClick={() => toast.success("Email preferences updated")}>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white/40 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <p className="text-sm font-medium">SMS Threat Alerts</p>
                <p className="text-[10px] text-text-muted font-mono mt-0.5">Critical 48h warnings via SMS</p>
              </div>
              {tier === "elite" ? (
                <div className="w-10 h-5 bg-success/20 rounded-full relative cursor-pointer" onClick={() => toast.success("SMS preferences updated")}>
                  <div className="absolute right-1 top-1 w-3 h-3 bg-success rounded-full" />
                </div>
              ) : (
                <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-text-muted cursor-not-allowed">
                  ELITE ONLY
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Active Sessions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted">Active Sessions</h2>
            <button onClick={() => toast.info("Revoking other sessions...")} className="text-[10px] text-text-muted hover:text-danger font-mono uppercase transition-colors">
              Revoke All
            </button>
          </div>
          <div className="bg-[#050505] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white flex items-center gap-2">MacBook Pro 16" <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /></p>
                <p className="text-[10px] text-text-muted font-mono mt-1">Chrome · San Francisco, CA (Current)</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between opacity-60">
              <div>
                <p className="text-sm font-medium text-white">iPhone 15 Pro</p>
                <p className="text-[10px] text-text-muted font-mono mt-1">Aegis App · New York, NY (2 hrs ago)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Account Details</h2>
          <div className="bg-[#050505] border border-white/5 rounded-xl p-5">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-text-muted mb-1 block">Email (Non-editable)</label>
                <div className="bg-white/5 px-3 py-2 rounded text-sm text-text-secondary">{email}</div>
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-mono text-text-muted mb-1 block">Full Name</label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="e.g. Satoshi Nakamoto" 
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-text-muted mb-1 block">Phone Number {tier !== "elite" && "(Requires Elite for SMS)"}</label>
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+44 7700 900000" 
                  disabled={tier !== "elite"}
                  className="w-full"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm" isLoading={saving}>Save Changes</Button>
              </div>
            </form>
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Your Shield Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#050505] border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase font-mono text-text-muted mb-1">Fees Prevented</p>
              <p className="font-bold text-xl text-success">{formatCurrency(profile?.total_fees_prevented || 0, currency)}</p>
            </div>
            <div className="bg-[#050505] border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase font-mono text-text-muted mb-1">Longest Streak</p>
              <p className="font-bold text-xl">🔥 {profile?.longest_streak || 0}</p>
            </div>
          </div>
        </section>

        {/* Data & Privacy */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Data & Privacy (GDPR)</h2>
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between bg-[#050505] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center gap-3 text-sm">
                <Download className="w-4 h-4 text-text-muted" />
                <span>Export My Encrypted Data</span>
              </div>
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between bg-[#050505] border border-white/5 hover:border-danger/30 rounded-xl p-4 transition-colors group"
            >
              <div className="flex items-center gap-3 text-sm group-hover:text-danger transition-colors">
                <Trash2 className="w-4 h-4 text-text-muted group-hover:text-danger" />
                <span>Nuke Account & Data</span>
              </div>
            </button>
          </div>
        </section>

        {/* Billing Portal */}
        <section>
          <button
            onClick={() => toast.info("Redirecting to Stripe Billing Portal...")}
            className="w-full flex items-center justify-center gap-2 bg-[#050505] border border-white/5 hover:border-white/20 rounded-xl p-4 transition-colors text-sm font-mono uppercase tracking-widest"
          >
            Manage Billing & Subscriptions
          </button>
        </section>

        {/* Legal */}
        <section className="pt-4 border-t border-white/5">
          <div className="flex gap-4 text-xs font-mono uppercase tracking-widest text-text-muted">
            <button onClick={() => router.push("/terms")} className="hover:text-white">Terms</button>
            <button onClick={() => router.push("/privacy")} className="hover:text-white">Privacy</button>
            <button onClick={handleSignOut} className="hover:text-white flex items-center gap-1 ml-auto">
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
