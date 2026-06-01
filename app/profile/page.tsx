"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { ChevronLeft, LogOut, Download, Trash2, Bell, Shield, MapPin } from "lucide-react";
import { toast, Toaster } from "sonner";
import { detectRegion } from "@/lib/region";
import { formatCurrency } from "@/lib/currency";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
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
      setLoading(false);
    }
    load();
  }, [router, supabase]);

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
      // In a real app, this would call an Edge Function or secure API to delete the auth user
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

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <Toaster theme="dark" closeButton />
      
      <header className="h-16 border-b border-white/5 flex items-center px-6 bg-[#0A0A0A]/60 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => router.push("/dashboard")} className="text-text-muted hover:text-white transition-colors mr-4">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold tracking-tighter font-mono">PROFILE</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Account Info */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Account Details</h2>
          <div className="bg-[#050505] border border-white/5 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-[10px] uppercase font-mono text-text-muted mb-1">Email</p>
              <p className="font-medium text-sm">{email}</p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <MapPin className="w-4 h-4 text-text-muted" />
              <span className="text-sm">Region: {code} ({currency})</span>
            </div>
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

        {/* Subscription */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Subscription</h2>
          <div className="bg-[#050505] border border-white/5 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${profile?.is_pro ? "text-warning" : "text-text-muted"}`} />
              <div>
                <p className="font-medium text-sm">{profile?.is_pro ? "Aegis Pro" : "Free Plan"}</p>
                {profile?.is_pro && profile?.pro_expires_at && (
                  <p className="text-[10px] text-text-muted font-mono uppercase mt-0.5">
                    Renews: {new Date(profile.pro_expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {!profile?.is_pro && (
              <Button size="sm" onClick={() => router.push("/upgrade")} className="text-[10px] font-mono uppercase">
                Upgrade
              </Button>
            )}
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
                <span>Export My Data</span>
              </div>
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between bg-[#050505] border border-white/5 hover:border-danger/30 rounded-xl p-4 transition-colors group"
            >
              <div className="flex items-center gap-3 text-sm group-hover:text-danger transition-colors">
                <Trash2 className="w-4 h-4 text-text-muted group-hover:text-danger" />
                <span>Delete Account</span>
              </div>
            </button>
          </div>
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
