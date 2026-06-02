"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import GlobalKat from "@/components/GlobalKat";
import HealthScore from "@/components/HealthScore";
import AIBriefing from "@/components/AIBriefing";
import ContextualTour from "@/components/ContextualTour";
import FlexCard from "@/components/FlexCard";
import ManualEntryModal from "@/components/ManualEntryModal";
import { formatCurrency } from "@/lib/currency";
import { detectRegion } from "@/lib/region";
import { fetchUserPayments } from "@/app/actions";
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
  const [tier, setTier] = useState<"free" | "pro" | "elite">("free");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [showFlexCard, setShowFlexCard] = useState(false);
  const [showInvestPrompt, setShowInvestPrompt] = useState<number | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email || "");
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("users")
        .select("total_fees_prevented, streak_count, longest_streak, tier, referral_code, referred_by, scan_date, wallet_balance")
        .eq("id", user.id)
        .single();

      if (profile) {
        setTotalFeesPrevented(Number(profile.total_fees_prevented) || 0);
        setStreakCount(profile.streak_count || 0);
        setLongestStreak(profile.longest_streak || 0);
        setTier(profile.tier || "free");
        setReferralCode(profile.referral_code);
        setWalletBalance(Number(profile.wallet_balance) || 0);

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

      try {
        const decryptedData = await fetchUserPayments();
        setPayments(decryptedData as DBPayment[]);
      } catch (e) {
        toast.error("Failed to fetch payments.");
      }
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

    if (feeAmount > 0) {
      setTimeout(() => setShowInvestPrompt(feeAmount), 1500);
    }
  };

  const { currency } = detectRegion();

  const handleShare = async () => {
    setShowFlexCard(true);
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

  let exposureColor = "text-text-primary";
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

      {showFlexCard && (
        <FlexCard 
          streak={streakCount} 
          totalFeesPrevented={totalFeesPrevented} 
          tier={tier} 
          onClose={() => setShowFlexCard(false)} 
        />
      )}

      {showInvestPrompt !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-background border border-border rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <Sparkles className="w-8 h-8 text-success mb-4" />
            <h2 className="text-xl font-medium tracking-tight text-text-primary mb-2">Auto-Wealth Engine</h2>
            <p className="text-sm text-text-muted mb-6">
              You just prevented a {formatCurrency(showInvestPrompt, currency)} late fee. Most apps stop here. 
              Do you want to auto-invest this spread into Aegis Wealth (S&P 500) and turn debt prevention into compound wealth?
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => { toast.success("£" + showInvestPrompt + " allocated to S&P 500."); setShowInvestPrompt(null); }} fullWidth className="font-mono uppercase tracking-widest text-xs border-success/30 bg-success/10 text-success hover:bg-success/20">
                Invest £{showInvestPrompt.toFixed(2)}
              </Button>
              <Button onClick={() => setShowInvestPrompt(null)} variant="ghost" fullWidth className="font-mono uppercase tracking-widest text-xs">
                Keep it in Checking
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <ManualEntryModal 
        isOpen={showManualEntry} 
        onClose={() => setShowManualEntry(false)} 
        userId={userId} 
        onAdded={async () => {
          const decryptedData = await fetchUserPayments();
          setPayments(decryptedData as DBPayment[]);
        }} 
      />

      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface/60 backdrop-blur-md sticky top-0 z-50">
        <span className="font-bold tracking-tighter cursor-pointer font-mono" onClick={() => router.push("/")}>
          AEGIS.
        </span>
        <div className="flex items-center gap-2">
          {tier === "free" ? (
            <Button variant="ghost" size="sm" onClick={() => router.push("/upgrade")}
              className="font-mono text-xs uppercase tracking-widest text-warning">
              Upgrade
            </Button>
          ) : tier === "elite" ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-hover border border-gold/30 text-[10px] font-mono text-gold uppercase tracking-widest font-bold">
              <Sparkles className="w-3 h-3" /> ELITE
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-hover border border-border text-[10px] font-mono text-text-secondary uppercase tracking-widest">
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
              className="w-8 h-8 rounded-full border border-border bg-[#111] flex items-center justify-center font-mono text-[10px] uppercase cursor-pointer"
              title={userEmail}
              onClick={() => router.push("/profile")}
            >
              {userEmail ? userEmail.substring(0, 2) : "US"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-32">
        <GlobalKat />
        
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-semibold tracking-tight">Debt Shield</h1>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-text-muted mb-1">Total Liability</p>
                <div id="dashboard-total-debt" className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-numeric">{formatCurrency(totalLiability, currency)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono uppercase tracking-widest text-text-muted mb-1">Aegis Wallet</p>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-2xl font-bold font-numeric text-success">{formatCurrency(walletBalance, currency)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-3">
              <Button size="sm" variant="secondary" onClick={() => router.push("/onboarding")} className="flex-1 text-xs" icon={<Scan className="w-4 h-4"/>}>
                AI Scan
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowManualEntry(true)} className="flex-1 text-xs" icon={<Plus className="w-4 h-4"/>}>
                Manual Entry
              </Button>
            </div>
          </section>

          {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-border border-t-white/60 rounded-full animate-spin" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">Loading</span>
          </div>
        ) : payments.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full border border-border bg-surface-hover flex items-center justify-center mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            </div>

            {/* Visual Timeline (Phase 7D) */}
            {activePayments.length > 0 && (
              <div className="bg-background border border-border rounded-xl p-6 overflow-hidden relative">
                <h3 className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-4">Exposure Timeline</h3>
                <div className="relative h-16 w-full flex items-center">
                  <div className="absolute left-0 right-0 h-px bg-surface-active" />
                  {activePayments.map((p, i) => {
                    const daysLeft = Math.ceil((new Date(p.due_date).getTime() - Date.now()) / 86400000);
                    // Map 0-30 days to 0-100% width
                    const leftPos = Math.max(0, Math.min(100, (daysLeft / 30) * 100));
                    return (
                      <div 
                        key={p.id} 
                        className={`absolute w-3 h-3 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-pointer
                          ${p.status === 'overdue' ? 'bg-danger animate-pulse' : daysLeft < 3 ? 'bg-warning' : 'bg-surface-hover0'}
                        `}
                        style={{ left: `${leftPos}%`, top: '50%' }}
                        title={`${p.provider_name}: ${formatCurrency(Number(p.amount_due), currency)} in ${daysLeft} days`}
                      >
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono text-text-muted">
                          {daysLeft < 0 ? 'LATE' : `${daysLeft}d`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tier === "elite" && (
              <AIBriefing payments={activePayments} tier={tier} />
            )}
            {tier !== "elite" && activePayments.length > 0 && (
              <div 
                onClick={() => router.push('/upgrade')}
                className="rounded-xl border border-border bg-surface p-5 cursor-pointer hover:border-gold/30 transition-colors flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" /> Executive AI Briefing</h3>
                  <p className="text-xs text-text-secondary mt-1">Upgrade to Elite to unlock custom financial AI analysis.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted" />
              </div>
            )}

            {/* PAYMENT TABS */}
            <div>
              <div
                id="dashboard-active-tab"
                className="flex items-center gap-0 border-b border-border mb-5"
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
                        ? "text-text-primary border-white"
                        : "text-text-muted border-transparent hover:text-text-muted"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    <span className="bg-surface-active px-1.5 py-0.5 rounded text-[9px]">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Active Payments */}
              {activeTab === "active" && (
                <div className="space-y-2">
                  {sortedPayments.length === 0 ? (
                    <div className="text-center py-12 border border-border border-dashed rounded-xl">
                      <p className="text-success font-mono text-sm">Zero active liabilities.</p>
                      <p className="text-text-muted text-xs mt-1 font-mono">Credit file fully protected.</p>
                    </div>
                  ) : sortedPayments.map((payment, i) => {
                    const daysLeft = Math.ceil((new Date(payment.due_date).getTime() - Date.now()) / 86400000);
                    const ficoImpact = 15; // static since late_fee was removed for simplicity
                    const isOverdue = payment.status === "overdue";

                    return (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`group bg-surface border rounded-xl p-4 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${
                          isOverdue ? "border-danger/20 bg-danger/5" : "border-border hover:border-border"
                        }`}
                      >
                        <div className="flex gap-4 items-center flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-[10px] uppercase font-bold ${
                            isOverdue ? "bg-danger/10 text-danger" : "bg-surface-hover text-text-muted"
                          }`}>
                            {(payment.provider_name || "UN").substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary text-sm mb-0.5">{payment.provider_name}</p>
                            <div className="flex items-center gap-2 text-[11px] text-text-secondary font-mono">
                              <span className="capitalize">Liability</span>
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

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto border-t sm:border-0 border-border pt-3 sm:pt-0">
                          <div className="flex items-center gap-1 text-danger/70 font-mono text-[10px]">
                            <TrendingDown className="w-3 h-3" />
                            <span>-{ficoImpact} pts if missed</span>
                          </div>
                          <div className="font-bold text-base font-numeric">
                            {formatCurrency(Number(payment.amount_due), payment.currency || currency)}
                          </div>
                          
                          {isOverdue ? (
                            <div className="flex flex-col gap-2 min-w-[120px]">
                              <Button
                                size="sm"
                                onClick={() => handleSettle(payment)}
                                className="h-8 px-3 font-mono text-xs uppercase tracking-widest bg-danger text-text-primary hover:bg-danger/80 border-none"
                              >
                                Settle Now
                              </Button>
                              <div className="flex flex-col gap-1">
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(`Hi ${payment.provider_name} Support,\n\nI am writing to request a brief 5-day extension on my upcoming payment of ${formatCurrency(Number(payment.amount_due), payment.currency || currency)}. I am experiencing a temporary cash flow delay and will settle the balance on [DATE].\n\nThank you.`);
                                    toast.success("Extension email drafted to clipboard.");
                                  }}
                                  className="text-[10px] text-text-muted hover:text-text-primary font-mono text-left"
                                >
                                  &gt; Draft Extension
                                </button>
                                <button 
                                  onClick={() => toast.info("Refinance simulator mocked.")}
                                  className="text-[10px] text-text-muted hover:text-text-primary font-mono text-left"
                                >
                                  &gt; Sim Refinance
                                </button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSettle(payment)}
                              className="h-8 px-3 font-mono text-xs uppercase tracking-widest"
                            >
                              Settle
                            </Button>
                          )}
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
                    <div className="text-center py-12 border border-border border-dashed rounded-xl">
                      <p className="text-text-muted font-mono text-sm">No settled payments yet.</p>
                    </div>
                  ) : historyPayments.map((payment, i) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 opacity-60"
                    >
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary line-through truncate">{payment.provider_name}</p>
                        <p className="text-[11px] text-text-muted font-mono capitalize">
                          Settled {new Date(payment.paid_at || "").toLocaleDateString("en-GB")}
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
                className="group relative bg-background border border-border hover:border-border rounded-xl p-5 text-left transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />
                <Shield className="w-5 h-5 text-success mb-3" />
                <p className="font-medium text-sm text-text-primary mb-1">Share Your Shield</p>
                <p className="text-xs text-text-muted font-mono leading-relaxed">
                  Generate your Debt Shield Card and share with friends.
                </p>
              </button>

              {/* Referral */}
              {referralCode && (
                <div className="bg-background border border-border rounded-xl p-5 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/3 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />
                  <Share2 className="w-5 h-5 text-text-secondary mb-3" />
                  <p className="font-medium text-sm text-text-primary mb-1">Give Pro, Get Pro.</p>
                  <div className="flex items-center gap-2 mt-3 bg-[#111] border border-border rounded-lg p-1">
                    <span className="flex-1 font-mono text-[11px] text-text-muted px-2 truncate">
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
        </div>
      </main>
    </div>
  );
}
