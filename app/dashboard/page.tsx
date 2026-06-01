"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Plus, LogOut, Check, TrendingDown, DollarSign, Scan, ArrowRight, Zap, AlertTriangle, Share2, Copy, History, List } from "lucide-react";
import { toast, Toaster } from "sonner";
import type { DBPayment } from "@/lib/database.types";
import PixelKat from "@/components/PixelKat";
import FeatureTour from "@/components/FeatureTour";

export default function Dashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [payments, setPayments] = useState<DBPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [totalFeesPrevented, setTotalFeesPrevented] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email || "");

      // Fetch user profile for fees prevented and pro status
      const { data: profile } = await supabase
        .from("users")
        .select("total_fees_prevented, streak_count, longest_streak, is_pro, referral_code, referred_by")
        .eq("id", user.id)
        .single();
        
      if (profile) {
        setTotalFeesPrevented(Number(profile.total_fees_prevented) || 0);
        setStreakCount(profile.streak_count || 0);
        setLongestStreak(profile.longest_streak || 0);
        setIsPro(profile.is_pro || false);
        setReferralCode(profile.referral_code);
        setReferredBy(profile.referred_by);

        // Check for stored referral code if not already referred
        const storedRef = localStorage.getItem("aegis_ref");
        if (storedRef && !profile.referred_by) {
          // Find the user with this referral code
          const { data: referrer } = await supabase
            .from("users")
            .select("id")
            .eq("referral_code", storedRef)
            .single();

          if (referrer) {
            await supabase
              .from("users")
              .update({ referred_by: referrer.id })
              .eq("id", user.id);
            setReferredBy(referrer.id);
            toast.success("Referral applied! When you upgrade, your friend gets a free month.");
          }
          localStorage.removeItem("aegis_ref"); // Clear it
        }
      }

      // Fetch all payments
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) { toast.error("Failed to fetch payments."); }
      else { setPayments((data as DBPayment[]) || []); }
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSettle = async (payment: DBPayment) => {
    const prev = [...payments];
    setPayments((p) => p.filter((x) => x.id !== payment.id));

    const { error } = await supabase
      .from("payments")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", payment.id);

    if (error) {
      toast.error("Failed to settle.");
      setPayments(prev);
    } else {
      // Increment Streak (always increments on a successful settle)
      const newStreak = streakCount + 1;
      const newLongest = Math.max(longestStreak, newStreak);
      setStreakCount(newStreak);
      setLongestStreak(newLongest);

      // Calculate new total fees prevented if there was a late fee
      const feeAmount = payment.late_fee ? Number(payment.late_fee) : 0;
      const newTotal = totalFeesPrevented + feeAmount;
      if (feeAmount > 0) setTotalFeesPrevented(newTotal);
      
      // Update DB in background
      supabase
        .from("users")
        .update({ 
          total_fees_prevented: newTotal,
          streak_count: newStreak,
          longest_streak: newLongest
        })
        .eq("id", payment.user_id)
        .then(() => {});

      // Milestone celebrations logic
      if (feeAmount > 0) {
        if (newTotal >= 10 && totalFeesPrevented < 10) {
          toast.success("Milestone: You've saved your first £10 in late fees!", { duration: 5000 });
        } else if (newTotal >= 50 && totalFeesPrevented < 50) {
          toast.success("Milestone: £50 protected. That's a month of groceries.", { duration: 5000 });
        } else if (newTotal >= 100 && totalFeesPrevented < 100) {
          toast.success("Milestone: £100 saved. Aegis is paying for itself.", { duration: 5000 });
        } else {
          toast.success(`Payment settled. You avoided a £${feeAmount} fee.`, {
            description: !isPro ? "Pro users get alerts so they never forget." : "Credit file protected.",
          });
        }
      } else {
        toast.success(`Payment settled. Streak is now 🔥${newStreak}!`, {
          description: "Credit file protected."
        });
      }
    }
  };

  const activePayments = payments.filter((p) => p.status !== "paid");
  const historyPayments = payments.filter((p) => p.status === "paid").sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime());

  const totalLiability = activePayments.reduce((s, p) => s + Number(p.amount_due), 0);
  
  // Sort by urgency: overdue first, then nearest due date
  const sortedPayments = [...activePayments].sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  // Color coding exposure
  let exposureColor = "text-white";
  let exposureLabel = "All Clear";
  if (totalLiability > 500) {
    exposureColor = "text-danger";
    exposureLabel = "High Exposure";
  } else if (totalLiability > 100) {
    exposureColor = "text-warning";
    exposureLabel = "Moderate Exposure";
  } else if (totalLiability > 0) {
    exposureColor = "text-success";
    exposureLabel = "Low Exposure";
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Toaster theme="dark" closeButton />
      <FeatureTour />
      
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0A]/50 backdrop-blur-md sticky top-0 z-50">
        <span className="font-bold tracking-tighter cursor-pointer" onClick={() => router.push("/")}>Aegis.</span>
        <div className="flex gap-3 items-center">
          {!isPro ? (
            <Button variant="ghost" size="sm" onClick={() => router.push("/upgrade")}>Pro</Button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80">
              <Zap className="w-3 h-3 text-warning" />
              PRO
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={() => router.push("/onboarding")} icon={<Plus className="w-3 h-3" />}>Scan</Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut} icon={<LogOut className="w-3.5 h-3.5" />}>
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
          <div className="w-8 h-8 rounded-full border border-white/10 bg-[#111111] flex items-center justify-center font-mono text-[10px]" title={userEmail}>
            {userEmail ? userEmail.substring(0, 2).toUpperCase() : "US"}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        
        {loading ? (
          <div className="animate-pulse flex flex-col items-center justify-center py-20">
            <div className="w-32 h-16 bg-white/5 rounded-lg mb-4" />
            <div className="w-48 h-4 bg-white/5 rounded-md" />
          </div>
        ) : payments.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6">
              <Scan className="w-8 h-8 text-text-muted" />
            </div>
            <h2 className="text-2xl font-medium tracking-tight mb-3">No active liabilities</h2>
            <p className="text-text-secondary text-sm mb-8 max-w-sm">
              Upload a screenshot of your Klarna, Afterpay, or Clearpay app to start tracking your exposure.
            </p>
            <Button size="lg" onClick={() => router.push("/onboarding")} icon={<ArrowRight className="w-4 h-4" />}>
              Scan a Screenshot
            </Button>
            
            {totalFeesPrevented > 0 && (
              <div className="mt-16 flex items-center gap-2 text-text-muted font-mono text-xs">
                <Check className="w-4 h-4 text-success" />
                You&apos;ve prevented £{totalFeesPrevented.toFixed(2)} in fees so far.
              </div>
            )}
          </div>
        ) : (
          <>
            {/* The One-Number Dashboard Hero */}
            <div className="flex flex-col items-center text-center mb-10">
              <p className="font-mono text-[11px] text-text-muted uppercase tracking-widest mb-3">Total Exposure</p>
              <h1 className={`text-6xl md:text-8xl font-semibold tracking-tighter mb-4 ${exposureColor}`}>
                £{totalLiability.toFixed(2)}
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm">
                <span className={exposureColor}>●</span> {exposureLabel}
              </div>

              {totalFeesPrevented > 0 && (
                <div className="mt-8 flex items-center gap-1.5 text-text-secondary text-sm bg-[#111] px-4 py-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push("/community")}>
                  <DollarSign className="w-4 h-4 text-success" />
                  Total late fees prevented: <span className="font-medium text-white">£{totalFeesPrevented.toFixed(2)}</span>
                  <ArrowRight className="w-3 h-3 ml-2 text-text-muted" />
                </div>
              )}
            </div>

            {/* Companion Section */}
            <div className="mb-10">
              <PixelKat streak={streakCount} hasOverdue={sortedPayments.some(p => p.status === 'overdue')} />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-white/5 mb-6">
              <button 
                onClick={() => setActiveTab("active")}
                className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "active" ? "text-white border-b-2 border-white" : "text-text-muted hover:text-white"}`}
              >
                <List className="w-4 h-4" /> Active ({activePayments.length})
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "history" ? "text-white border-b-2 border-white" : "text-text-muted hover:text-white"}`}
              >
                <History className="w-4 h-4" /> History
              </button>
            </div>

            {activeTab === "active" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  {sortedPayments.length === 0 ? (
                    <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                      <p className="text-text-secondary text-sm">No active liabilities. You are completely debt free!</p>
                    </div>
                  ) : sortedPayments.map((payment, i) => {
                    const daysLeft = Math.ceil((new Date(payment.due_date).getTime() - Date.now()) / 86400000);
                    const ficoImpact = payment.late_fee ? Math.min(40, Math.round(Number(payment.late_fee) * 2.5)) : 15;
                    
                    return (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                      >
                        <div className="flex gap-4 items-center flex-1">
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-text-muted font-mono text-xs uppercase">
                            {payment.provider.substring(0,2)}
                          </div>
                          <div>
                            <p className="font-medium text-white mb-0.5">{payment.item_name}</p>
                            <div className="flex items-center gap-3 text-xs text-text-secondary">
                              <span className="capitalize">{payment.provider}</span>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              {payment.status === "overdue" ? (
                                <span className="text-danger font-medium flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Overdue
                                </span>
                              ) : (
                                <span>{daysLeft <= 0 ? "Due today" : `Due in ${daysLeft} days`}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-0 border-white/5 pt-3 sm:pt-0">
                          <div className="flex items-center gap-1 text-danger/80 font-mono text-[10px]">
                            <TrendingDown className="w-3 h-3" />
                            <span>-{ficoImpact} pts if missed</span>
                          </div>
                          
                          <div className="text-right font-medium text-lg">
                            £{Number(payment.amount_due).toFixed(2)}
                          </div>

                          <Button 
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSettle(payment)} 
                            className="h-9 px-3"
                          >
                            Settle
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-2">
                {historyPayments.length === 0 ? (
                  <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                    <p className="text-text-secondary text-sm">No payment history yet.</p>
                  </div>
                ) : historyPayments.map((payment, i) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between opacity-70"
                  >
                    <div className="flex gap-4 items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white line-through text-sm">{payment.item_name}</p>
                        <p className="text-xs text-text-secondary capitalize">{payment.provider} • Settled on {new Date(payment.paid_at || "").toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="font-medium text-text-secondary line-through">
                      £{Number(payment.amount_due).toFixed(2)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Referral Section */}
            {referralCode && (
              <div className="mt-12 bg-[#050505] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-5 h-5 text-text-primary" />
                    <h3 className="text-xl font-medium">Give Pro, Get Pro.</h3>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Share Aegis with your friends. When they upgrade to Pro, you both get 30 days of Pro for free.
                  </p>
                </div>

                <div className="w-full md:w-auto relative z-10">
                  <div className="flex items-center gap-2 bg-[#111] border border-white/10 rounded-lg p-1">
                    <div className="px-3 py-2 font-mono text-sm text-white/80 select-all truncate w-full md:w-48">
                      getaegis.app/?ref={referralCode}
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(`https://getaegis.app/?ref=${referralCode}`);
                        toast.success("Referral link copied!");
                      }}
                      icon={<Copy className="w-4 h-4" />}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
