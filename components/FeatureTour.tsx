"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { X, ArrowRight, ShieldCheck, Gamepad2, Users } from "lucide-react";

const STEPS = [
  {
    title: "The One-Number Dashboard",
    description: "Your entire BNPL liability is boiled down to a single number. We sort your payments by urgency, highlighting overdue items in red so you know exactly what is hurting your credit score.",
    icon: <ShieldCheck className="w-12 h-12 text-success" />
  },
  {
    title: "Meet Your Companion",
    description: "Settle payments on time to build your streak. Your Aegis Companion (the Pixel Kat) will level up alongside your financial health. Miss a payment, and your streak resets.",
    icon: <Gamepad2 className="w-12 h-12 text-warning" />
  },
  {
    title: "Community & Leaderboards",
    description: "Join the Global Feed to see how much debt other users are crushing. Ask questions, get advice, and compete anonymously on the Leaderboard.",
    icon: <Users className="w-12 h-12 text-blue-400" />
  }
];

export default function FeatureTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Only show if they haven't seen it yet
    const hasSeenTour = localStorage.getItem("aegis_tour_seen");
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("aegis_tour_seen", "true");
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center flex flex-col items-center">
              <div className="mb-6 flex items-center justify-center">
                {STEPS[currentStep].icon}
              </div>
              
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-2">
                Aegis Tour ({currentStep + 1}/{STEPS.length})
              </div>
              
              <h2 className="text-2xl font-semibold text-white mb-4">
                {STEPS[currentStep].title}
              </h2>
              
              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                {STEPS[currentStep].description}
              </p>

              <div className="w-full flex gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1"
                  onClick={handleClose}
                >
                  Skip
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleNext}
                  icon={currentStep === STEPS.length - 1 ? <ShieldCheck className="w-4 h-4"/> : <ArrowRight className="w-4 h-4"/>}
                >
                  {currentStep === STEPS.length - 1 ? "Let's Go" : "Next"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
