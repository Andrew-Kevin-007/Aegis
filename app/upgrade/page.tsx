"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ShieldCheck, Check, Sparkles, ChevronLeft, Zap, Infinity as InfinityIcon } from "lucide-react";
import { toast, Toaster } from "sonner";

type Plan = "monthly" | "half-year" | "annual";

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<Plan | null>(null);

  const handlePayment = async (plan: Plan) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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
          
          {/* Monthly */}
          <Card variant="elevated" className="border-white/5 relative flex flex-col">
            <div className="mb-6 flex-1">
              <span className="font-mono text-xs uppercase tracking-widest text-text-muted block mb-4">Monthly</span>
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-bold font-numeric">£9.99</span>
                <span className="text-text-muted text-xs ml-1">/ month</span>
              </div>
              <p className="text-text-secondary text-sm mb-6">Flexible protection, cancel anytime.</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">Unlimited scans</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">48-hour alerts</span>
                </div>
              </div>
            </div>

            <Button 
              fullWidth 
              variant="secondary"
              isLoading={loading === "monthly"} 
              onClick={() => handlePayment("monthly")}
            >
              Get Monthly
            </Button>
          </Card>

          {/* Annual */}
          <Card variant="elevated" className="border-white/20 bg-white/5 relative flex flex-col scale-105 shadow-2xl z-10">
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <span className="bg-white text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            
            <div className="mb-6 flex-1">
              <span className="font-mono text-xs uppercase tracking-widest text-white block mb-4">Annual</span>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold font-numeric">£79.99</span>
                <span className="text-text-muted text-xs ml-1">/ year</span>
              </div>
              <p className="text-white/80 text-sm mb-6">Save 33%. Equivalent to £6.67/mo.</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Unlimited scans</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">48-hour alerts</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Credit Armor Dashboard</span>
                </div>
              </div>
            </div>

            <Button 
              fullWidth 
              isLoading={loading === "annual"} 
              onClick={() => handlePayment("annual")}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Get Annual
            </Button>
          </Card>

          {/* Half-Year */}
          <Card variant="elevated" className="border-white/5 relative flex flex-col">
            <div className="mb-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-text-muted block">Half-Year</span>
              </div>
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-bold font-numeric">£49.99</span>
                <span className="text-text-muted text-xs ml-1">/ 6 mo</span>
              </div>
              <p className="text-text-secondary text-sm mb-6">Save ~16%. Perfect for building habits.</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">Everything in Pro</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">Save on monthly costs</span>
                </div>
              </div>
            </div>

            <Button 
              fullWidth 
              variant="secondary"
              isLoading={loading === "half-year"} 
              onClick={() => handlePayment("half-year")}
            >
              Get Half-Year
            </Button>
          </Card>

        </div>
      </div>
    </main>
  );
}
