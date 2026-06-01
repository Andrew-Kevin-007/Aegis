"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import PixelKat from "@/components/PixelKat";
import HealthScore from "@/components/HealthScore";
import AIBriefing from "@/components/AIBriefing";
import ContextualTour from "@/components/ContextualTour";
import { formatCurrency } from "@/lib/currency";
import { detectRegion } from "@/lib/region";
import {
  Plus, LogOut, Check, TrendingDown, DollarSign, Scan,
  ArrowRight, Zap, AlertTriangle, Share2, Copy, History,
  List, Users, Shield, Sparkles
} from "lucide-react";
import { toast, Toaster } from "sonner";
import type { DBPayment } from "@/lib/database.types";

// --- Health Score Computation ---
function computeHealthScore(
  payments: DBPayment[],
  streak: number,
  scannedThisWeek: boolean
): number {
  const active = payments.filter(p => p.status !== "paid");
  const overdue = active.filter(p => p.status === "overdue");
  const totalLiability = active.reduce((s, p) => s + Number(p.amount_due), 0);
  const nearestDue = active.length > 0
    ? Math.min(...active.map(p => Math.ceil((new Date(p.due_date).getTime() - Date.now()) / 86400000)))
    : 99;

  let score = 100;
  score -= overdue.length * 15;
  score -= nearestDue < 3 ? 12 : nearestDue < 7 ? 5 : 0;
  score -= totalLiability > 500 ? 20 : totalLiability > 200 ? 10 : totalLiability > 50 ? 4 : 0;
  score += Math.min(streak * 2, 20);
  score += scannedThisWeek ? 5 : 0;
  return Math.max(0, Math.min(100, score));
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [payments, setPayments] = useState<DBPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [totalFeesPrevented, setTotalFeesPrevented] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email || "");
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("users")
        .select("total_fees_prevented, streak_count, longest_streak, is_pro, referral_code, referred_by, scan_date")
        .eq("id", user.id)
        .single();

      if (profile) {
        setTotalFeesPrevented(Number(profile.total_fees_prevented) || 0);
        setStreakCount(profile.streak_count || 0);
        setLongestStreak(profile.longest_streak || 0);
        setIsPro(profile.is_pro || false);
        setReferralCode(profile.referral_code);

        // Referral attribution
        const storedRef = localStorage.getItem("aegis_ref");
        if (storedRef && !profile.referred_by) {
          const { data: referrer } = await supabase
            .from("users").select("id").eq("referral_code", storedRef).single();
          if (referrer) {
            await supabase.from("users").update({ referred_by: referrer.id }).eq("id", user.id);
            toast.success("Referral applied! Your friend earns a bonus when you upgrade.");
          }
          localStorage.removeItem("aegis_ref");
        }
      }

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (error) toast.error("Failed to fetch payments.");
      else setPayments((data as DBPayment[]) || []);
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSettle = async (payment: DBPayment) => {
    // Optimistic update
    setPayments(p => p.map(x => x.id === payment.id ? { ...x, status: "paid", paid_at: new Date().toISOString() } : x));

    const { error } = await supabase
      .from("payments")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", payment.id);

    if (error) {
      toast.error("Failed to settle.");
      setPayments(p => p.map(x => x.id === payment.id ? { ...x, status: payment.status, paid_at: null } : x));
      return;
    }

    const newStreak = streakCount + 1;
    const newLongest = Math.max(longestStreak, newStreak);
    const feeAmount = payment.late_fee ? Number(payment.late_fee) : 0;
    const newTotal = totalFeesPrevented + feeAmount;

    setStreakCount(newStreak);
    setLongestStreak(newLongest);
    if (feeAmount > 0) setTotalFeesPrevented(newTotal);

    supabase.from("users").update({
      total_fees_prevented: newTotal,
      streak_count: newStreak,
      longest_streak: newLongest,
    }).eq("id", payment.user_id).then(() => {});

    if (feeAmount > 0 && newTotal >= 10 && totalFeesPrevented < 10)
      toast.success("Milestone: First £10 in late fees prevented!", { duration: 5000 });
    else if (feeAmount > 0 && newTotal >= 50 && totalFeesPrevented < 50)
      toast.success("Milestone: £50 protected. That's a month of groceries.", { duration: 5000 });
    else if (feeAmount > 0 && newTotal >= 100 && totalFeesPrevented < 100)
      toast.success("Milestone: £100 saved. Aegis paid for itself.", { duration: 5000 });
    else
      toast.success(`Settled. Streak: 🔥${newStreak}`, { description: "Credit file protected." });
  };

  const { currency } = detectRegion();

  const handleShare = async () => {
    setShareLoading(true);
    const url = `${window.location.origin}/api/shield/${userId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Aegis Debt Shield Card",
          text: `I've protected ${formatCurrency(totalFeesPrevented, currency)} in late fees with Aegis. Check yours.`,
          url: `https://getaegis.app?ref=${referralCode}`,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Shield card link copied!");
      }
    } catch (e) {}
    setShareLoading(false);
  };

  // --- Derived state ---
  const activePayments = payments.filter(p => p.status !== "paid");
  const historyPayments = payments
    .filter(p => p.status === "paid")
    .sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime());
  const totalLiability = activePayments.reduce((s, p) => s + Number(p.amount_due), 0);
  const sortedPayments = [...activePayments].sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (a.status !== "overdue" && b.status === "overdue") return 1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
  const healthScore = computeHealthScore(payments, streakCount, false);
  const hasOverdue = sortedPayments.some(p => p.status === "overdue");

  let exposureColor = "text-white";
  let exposureLabel = "All Clear";
  if (totalLiability > 500) { exposureColor = "text-danger"; exposureLabel = "High Exposure"; }
  else if (totalLiability > 100) { exposureColor = "text-warning"; exposureLabel = "Moderate Exposure"; }
  else if (totalLiability > 0) { exposureColor = "text-success"; exposureLabel = "Low Exposure"; }

  // Projected clear date
  let projectedClearDate = null;
  if (activePayments.length > 0) {
    const latestDate = Math.max(...activePayments.map(p => new Date(p.due_date).getTime()));
    projectedClearDate = new Date(latestDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const isDebtFree = activePayments.length === 0 && historyPayments.length > 0;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Toaster theme="dark" closeButton />
      <ContextualTour />

      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0A]/60 backdrop-blur-md sticky top-0 z-50">
        <span className="font-bold tracking-tighter cursor-pointer font-mono" onClick={() => router.push("/")}>
          AEGIS.
        </span>
        <div className="flex items-center gap-2">
          {!isPro ? (
            <Button variant="ghost" size="sm" onClick={() => router.push("/upgrade")}
              className="font-mono text-xs uppercase tracking-widest">
              Pro
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/80 uppercase tracking-widest">
              <Zap className="w-3 h-3 text-warning" /> PRO
            </div>
          )}
          
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/community")}
              icon={<Users className="w-3.5 h-3.5" />}>
              <span className="font-mono text-xs uppercase tracking-widest">Community</span>
            </Button>
            <Button
              id="dashboard-scan-button"
              variant="secondary"
              size="sm"
              onClick={() => router.push("/onboarding")}
              icon={<Plus className="w-3 h-3" />}
            >
              <span className="font-mono text-xs uppercase tracking-widest">Scan</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} icon={<LogOut className="w-3.5 h-3.5" />}>
              <span className="font-mono text-xs uppercase tracking-widest">Out</span>
            </Button>
            <div
              className="w-8 h-8 rounded-full border border-white/10 bg-[#111] flex items-center justify-center font-mono text-[10px] uppercase cursor-pointer"
              title={userEmail}
              onClick={() => router.push("/profile")}
            >
              {userEmail ? userEmail.substring(0, 2) : "US"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">Loading</span>
          </div>
        ) : payments.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6">
              <Scan className="w-8 h-8 text-text-muted" />
            </div>
            <h2 className="text-2xl font-medium tracking-tight mb-3">No liabilities tracked</h2>
            <p className="text-text-secondary text-sm mb-8 max-w-sm">
              Screenshot your Klarna, Afterpay, or Clearpay app and tap Scan. Our AI reads every payment in under 3 seconds.
            </p>
            <Button size="lg" onClick={() => router.push("/onboarding")} icon={<ArrowRight className="w-4 h-4" />}>
              Scan a Screenshot
            </Button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* HERO — Exposure number */}
            <div
              id="dashboard-exposure-hero"
              className="text-center py-8"
            >
              <p className="font-mono text-[11px] text-text-muted uppercase tracking-widest mb-3">
                Total BNPL Exposure
              </p>
              <h1 className={`text-7xl md:text-8xl font-bold tracking-tighter mb-4 ${exposureColor}`}>
                {formatCurrency(totalLiability, currency)}
              </h1>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-mono uppercase tracking-widest">
                <span className={`w-1.5 h-1.5 rounded-full ${hasOverdue ? "bg-danger animate-pulse" : totalLiability > 0 ? "bg-warning" : "bg-success"}`} />
                {exposureLabel}
              </div>

              {projectedClearDate && !isDebtFree && (
                <p className="font-mono text-xs text-text-muted mt-5">
                  At current pace, all liabilities cleared by: <strong className="text-white">{projectedClearDate}</strong>
                </p>
              )}

              {isDebtFree && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/30 text-success font-mono uppercase tracking-widest text-xs font-bold"
                >
                  <Sparkles className="w-4 h-4" /> DEBT FREE CELEBRATION
                </motion.div>
              )}

              {totalFeesPrevented > 0 && (
                <button
                  onClick={() => router.push("/community")}
                  className="mt-6 flex items-center gap-2 mx-auto text-sm text-text-secondary hover:text-white transition-colors font-mono"
                >
                  <DollarSign className="w-4 h-4 text-success" />
                  {formatCurrency(totalFeesPrevented, currency)} in late fees prevented
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* HEALTH SCORE */}
            <HealthScore score={healthScore} />

            {/* PIXEL KAT */}
            <PixelKat streak={streakCount} hasOverdue={hasOverdue} />

            {/* AI BRIEFING — only shown when there are active payments */}
            {activePayments.length > 0 && (
              <AIBriefing payments={activePayments} isPro={isPro} />
            )}

            {/* PAYMENT TABS */}
            <div>
              <div
                id="dashboard-active-tab"
                className="flex items-center gap-0 border-b border-white/5 mb-5"
              >
                {[
                  { id: "active" as const, label: "Active", icon: <List className="w-3.5 h-3.5" />, count: activePayments.length },
                  { id: "history" as const, label: "History", icon: <History className="w-3.5 h-3.5" />, count: historyPayments.length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 pb-3 text-xs font-mono uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? "text-white border-white"
                        : "text-text-muted border-transparent hover:text-white/60"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px]">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Active Payments */}
              {activeTab === "active" && (
                <div className="space-y-2">
                  {sortedPayments.length === 0 ? (
                    <div className="text-center py-12 border border-white/5 border-dashed rounded-xl">
                      <p className="text-success font-mono text-sm">Zero active liabilities.</p>
                      <p className="text-text-muted text-xs mt-1 font-mono">Credit file fully protected.</p>
                    </div>
                  ) : sortedPayments.map((payment, i) => {
                    const daysLeft = Math.ceil((new Date(payment.due_date).getTime() - Date.now()) / 86400000);
                    const ficoImpact = payment.late_fee ? Math.min(40, Math.round(Number(payment.late_fee) * 2.5)) : 15;
                    const isOverdue = payment.status === "overdue";

                    return (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`group bg-[#0A0A0A] border rounded-xl p-4 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${
                          isOverdue ? "border-danger/20 bg-danger/5" : "border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex gap-4 items-center flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-[10px] uppercase font-bold ${
                            isOverdue ? "bg-danger/10 text-danger" : "bg-white/5 text-text-muted"
                          }`}>
                            {payment.provider.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm mb-0.5">{payment.item_name}</p>
                            <div className="flex items-center gap-2 text-[11px] text-text-secondary font-mono">
                              <span className="capitalize">{payment.provider}</span>
                              <span>·</span>
                              {isOverdue ? (
                                <span className="text-danger font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> OVERDUE
                                </span>
                              ) : (
                                <span>{daysLeft <= 0 ? "Due today" : `${daysLeft}d remaining`}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto border-t sm:border-0 border-white/5 pt-3 sm:pt-0">
                          <div className="flex items-center gap-1 text-danger/70 font-mono text-[10px]">
                            <TrendingDown className="w-3 h-3" />
                            <span>-{ficoImpact} pts if missed</span>
                          </div>
                          <div className="font-bold text-base font-numeric">
                            {formatCurrency(Number(payment.amount_due), payment.currency || currency)}
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSettle(payment)}
                            className="h-8 px-3 font-mono text-xs uppercase tracking-widest"
                          >
                            Settle
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <div className="space-y-2">
                  {historyPayments.length === 0 ? (
                    <div className="text-center py-12 border border-white/5 border-dashed rounded-xl">
                      <p className="text-text-muted font-mono text-sm">No settled payments yet.</p>
                    </div>
                  ) : historyPayments.map((payment, i) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4 flex items-center gap-4 opacity-60"
                    >
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white line-through truncate">{payment.item_name}</p>
                        <p className="text-[11px] text-text-muted font-mono capitalize">
                          {payment.provider} · Settled {new Date(payment.paid_at || "").toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <div className="font-mono text-sm text-text-muted line-through">
                        {formatCurrency(Number(payment.amount_due), payment.currency || currency)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* SHARE SHIELD + REFERRAL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Share Shield Card */}
              <button
                onClick={handleShare}
                disabled={shareLoading}
                className="group relative bg-[#050505] border border-white/5 hover:border-white/10 rounded-xl p-5 text-left transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />
                <Shield className="w-5 h-5 text-success mb-3" />
                <p className="font-medium text-sm text-white mb-1">Share Your Shield</p>
                <p className="text-xs text-text-muted font-mono leading-relaxed">
                  Generate your Debt Shield Card and share with friends.
                </p>
              </button>

              {/* Referral */}
              {referralCode && (
                <div className="bg-[#050505] border border-white/5 rounded-xl p-5 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />
                  <Share2 className="w-5 h-5 text-text-secondary mb-3" />
                  <p className="font-medium text-sm text-white mb-1">Give Pro, Get Pro.</p>
                  <div className="flex items-center gap-2 mt-3 bg-[#111] border border-white/10 rounded-lg p-1">
                    <span className="flex-1 font-mono text-[11px] text-white/60 px-2 truncate">
                      getaegis.app/?ref={referralCode}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://getaegis.app/?ref=${referralCode}`);
                        toast.success("Referral link copied!");
                      }}
                      icon={<Copy className="w-3 h-3" />}
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest">Copy</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
