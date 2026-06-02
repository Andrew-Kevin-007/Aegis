"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ShieldCheck, Check, Sparkles, ChevronLeft, Zap, Infinity as InfinityIcon } from "lucide-react";
import { toast, Toaster } from "sonner";
import { detectRegion } from "@/lib/region";
import { formatCurrency } from "@/lib/currency";

type Plan = "pro-monthly" | "pro-annual" | "elite-annual";

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<Plan | null>(null);
  
  const { code, currency } = detectRegion();

  const getPrice = (plan: Plan) => {
    switch (code) {
      case "IN": return plan === "pro-monthly" ? 299 : plan === "pro-annual" ? 1499 : 2499;
      case "US": return plan === "pro-monthly" ? 11.99 : plan === "pro-annual" ? 59.99 : 99.99;
      case "DE":
      case "FR":
      case "ES":
      case "EU": return plan === "pro-monthly" ? 10.99 : plan === "pro-annual" ? 54.99 : 89.99;
      case "AU": return plan === "pro-monthly" ? 16.99 : plan === "pro-annual" ? 84.99 : 139.99;
      case "SA": return plan === "pro-monthly" ? 39.99 : plan === "pro-annual" ? 199.99 : 329.99;
      default: return plan === "pro-monthly" ? 9.99 : plan === "pro-annual" ? 49.99 : 79.99;
    }
  };

  const handlePayment = async (plan: Plan) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, currency }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate payment link");
      }

      // Initialize Razorpay Checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Aegis.",
        description: `Aegis Pro - ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          toast.success("Payment successful! Account upgraded to Pro.");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize payment.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-background text-text-primary flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      <Toaster theme="dark" closeButton />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <button 
        onClick={() => router.push("/dashboard")} 
        className="absolute top-8 left-8 text-text-secondary hover:text-white flex items-center gap-2 font-mono text-xs uppercase z-10"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="w-full max-w-5xl z-10">
        <div className="text-center mb-16">
          <Sparkles className="w-10 h-10 text-white mx-auto mb-4" />
          <h1 className="text-3xl font-semibold tracking-tight">Upgrade to Pro</h1>
          <p className="text-text-secondary text-sm mt-2 max-w-md mx-auto">
            Unlock fully automated alerting, unlimited scans, and advanced credit protection.
            Less than the cost of a single late fee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          
          {/* Pro Monthly */}
          <Card variant="elevated" className="border-white/5 relative flex flex-col">
            <div className="mb-6 flex-1">
              <span className="font-mono text-xs uppercase tracking-widest text-text-muted block mb-4">Aegis Pro</span>
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-bold font-numeric">{new Intl.NumberFormat(undefined, { style: "currency", currency, minimumFractionDigits: currency === 'INR' ? 0 : 2 }).format(getPrice("pro-monthly"))}</span>
                <span className="text-text-muted text-xs ml-1">/ month</span>
              </div>
              <p className="text-text-secondary text-sm mb-6">Unlimited AI scanning and active protection.</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">Unlimited AI scans</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">48-hour automated alerts</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">Live Greyscale Kat companion</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">Global Leaderboard Access</span>
                </div>
              </div>
            </div>

            <Button 
              fullWidth 
              variant="secondary"
              isLoading={loading === "pro-monthly"} 
              onClick={() => handlePayment("pro-monthly")}
            >
              Get Pro Monthly
            </Button>
          </Card>

          {/* Elite Annual */}
          <Card variant="elevated" className="border-white/20 bg-white/5 relative flex flex-col scale-105 shadow-2xl z-10">
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <span className="bg-white text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Ultimate Control
              </span>
            </div>
            
            <div className="mb-6 flex-1">
              <span className="font-mono text-xs uppercase tracking-widest text-white block mb-4 flex items-center gap-2">Aegis Elite <Sparkles className="w-3 h-3 text-gold" /></span>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold font-numeric text-warning">{new Intl.NumberFormat(undefined, { style: "currency", currency, minimumFractionDigits: currency === 'INR' ? 0 : 2 }).format(getPrice("elite-annual"))}</span>
                <span className="text-text-muted text-xs ml-1">/ year</span>
              </div>
              <p className="text-white/80 text-sm mb-6">AES-256 Encrypted Vault and Executive AI Briefings.</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Everything in Pro</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white font-bold">AES-256 Encrypted Data Vault</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Executive AI Roast Briefing</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Priority SMS Alerts</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white text-warning">Gold Crown Elite Community Flair</span>
                </div>
              </div>
            </div>

            <Button 
              fullWidth 
              isLoading={loading === "elite-annual"} 
              onClick={() => handlePayment("elite-annual")}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Get Elite Annual
            </Button>
          </Card>

          {/* Pro Annual */}
          <Card variant="elevated" className="border-white/5 relative flex flex-col">
            <div className="mb-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-text-muted block">Pro Annual</span>
              </div>
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-bold font-numeric">{new Intl.NumberFormat(undefined, { style: "currency", currency, minimumFractionDigits: currency === 'INR' ? 0 : 2 }).format(getPrice("pro-annual"))}</span>
                <span className="text-text-muted text-xs ml-1">/ year</span>
              </div>
              <p className="text-text-secondary text-sm mb-6">Save on monthly costs. Serious protection.</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">Everything in Pro Monthly</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">2 months free</span>
                </div>
              </div>
            </div>

            <Button 
              fullWidth 
              variant="secondary"
              isLoading={loading === "pro-annual"} 
              onClick={() => handlePayment("pro-annual")}
            >
              Get Pro Annual
            </Button>
          </Card>

        </div>
      </div>
    </main>
  );
}
