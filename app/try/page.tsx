"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, ChevronLeft, Scan, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Payment } from "@/lib/gemini";
import { toast, Toaster } from "sonner";
import Link from "next/link";

export default function TryPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedPayments, setExtractedPayments] = useState<Payment[]>([]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setStep(2);
      setLoading(true);

      try {
        const base64Data = await toBase64(file);
        const res = await fetch("/api/extract/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type,
          }),
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to process image.");
        }

        setExtractedPayments(data.payments || []);
        setStep(3);
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Unclear screenshot. Try another upload.");
        setStep(1);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemo = async () => {
    setStep(2);
    setLoading(true);
    
    // Simulate OCR delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    setExtractedPayments([
      { provider: "Klarna", item_name: "ASOS Order", amount_due: 45.00, currency: "GBP", due_date: new Date(Date.now() + 3 * 86400000).toISOString(), late_fee: null, status: "upcoming" },
      { provider: "Afterpay", item_name: "Nike Sneakers", amount_due: 120.00, currency: "GBP", due_date: new Date(Date.now() - 2 * 86400000).toISOString(), late_fee: 15.00, status: "overdue" },
    ]);
    
    setLoading(false);
    setStep(3);
  };

  const totalAmount = extractedPayments.reduce((sum, p) => sum + p.amount_due, 0);
  const overdueCount = extractedPayments.filter((p) => p.status === "overdue").length;

  return (
    <main className="min-h-screen bg-background flex flex-col sm:justify-center items-center relative overflow-hidden">
      <Toaster theme="dark" closeButton />
      <div className="w-full max-w-[400px] h-[100dvh] sm:h-[800px] sm:max-h-[90vh] bg-[#0A0A0A] sm:border sm:border-white/5 sm:rounded-[32px] flex flex-col relative overflow-hidden">
        
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 absolute top-0 inset-x-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md">
          {step > 1 && !loading ? (
            <button onClick={() => setStep(1)} className="text-text-secondary hover:text-white p-2 -ml-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link href="/" className="text-text-secondary hover:text-white p-2 -ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <span className="font-mono text-xs tracking-widest text-text-muted">TRY AEGIS</span>
          <div className="w-9" />
        </div>

        <div className="flex-1 mt-14 relative">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col p-6"
              >
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-6">
                    <Scan className="w-8 h-8 text-text-secondary" />
                  </div>
                  <h2 className="text-xl font-medium tracking-tight mb-2">Upload Screenshot</h2>
                  <p className="text-text-secondary text-sm">
                    Select a screenshot of your Klarna, Afterpay, or Clearpay app to see Aegis in action. No signup required.
                  </p>
                </div>
                
                <div className="pb-8 space-y-4">
                  <label className="w-full relative">
                    <div className="w-full h-14 bg-white text-black font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-200 transition-colors">
                      <Camera className="w-5 h-5" />
                      Open Photo Library
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </label>
                  
                  <Button variant="secondary" fullWidth size="lg" onClick={handleDemo}>
                    Or Use Demo Screenshot
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="flex-1 relative overflow-hidden bg-black">
                  {fileUrl && (
                    <Image src={fileUrl} alt="Scan" fill unoptimized className="object-cover opacity-30 grayscale" />
                  )}
                  <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent to-white/20 animate-scan-line border-b border-white" />
                  <div className="absolute inset-0 p-6 font-mono text-[10px] text-white/50 leading-relaxed overflow-hidden">
                    <p className="mb-2">&gt; INIT OCR MATRIX...</p>
                    <p className="mb-2">&gt; READING GRAPHICS...</p>
                    <p className="mb-2">&gt; DECODING VALUE LAYER...</p>
                    <p className="mb-2">&gt; QUERYING GEMINI ENGINE...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 flex flex-col p-6 bg-[#0A0A0A]"
              >
                <div className="flex-1 flex flex-col justify-center">
                  <div className="font-mono text-xs text-text-muted mb-4 uppercase tracking-widest border-b border-white/5 pb-2">
                    Analysis Complete
                  </div>
                  
                  <h2 className="text-4xl font-medium tracking-tight mb-2">
                    {extractedPayments.length} Liabilities
                  </h2>
                  <p className="text-text-secondary mb-10 font-mono text-sm">
                    £{totalAmount.toFixed(2)} Total Exposure
                  </p>

                  {overdueCount > 0 ? (
                    <div className="border border-danger/30 bg-danger/5 rounded-xl p-5 mb-6">
                      <p className="text-danger font-mono text-[10px] uppercase tracking-widest mb-2">[ CRITICAL ALERTS ]</p>
                      <p className="text-white text-sm">{overdueCount} payment(s) are marked as overdue. This is hurting your credit score right now.</p>
                    </div>
                  ) : (
                    <div className="border border-success/30 bg-success/5 rounded-xl p-5 mb-6">
                      <p className="text-success font-mono text-[10px] uppercase tracking-widest mb-2">[ HEALTH REPORT ]</p>
                      <p className="text-white text-sm">All payments are upcoming. No immediate late risks detected.</p>
                    </div>
                  )}

                  <div className="space-y-2 mt-4 text-sm text-text-secondary">
                    {extractedPayments.slice(0, 3).map((p, i) => (
                      <div key={i} className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span>{p.provider} • {new Date(p.due_date).toLocaleDateString()}</span>
                        <span className="font-medium text-white">£{Number(p.amount_due).toFixed(2)}</span>
                      </div>
                    ))}
                    {extractedPayments.length > 3 && (
                      <div className="text-center pt-2 text-xs text-text-muted">
                        + {extractedPayments.length - 3} more payments
                      </div>
                    )}
                  </div>
                </div>

                <div className="pb-8">
                  <Button fullWidth size="lg" onClick={() => router.push('/login?next=/onboarding')} icon={<ArrowRight className="w-4 h-4"/>}>
                    Save these results — Sign up free
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
