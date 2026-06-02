import React, { useRef } from "react";
import { Shield, Sparkles, X } from "lucide-react";
import Button from "./ui/Button";

interface FlexCardProps {
  streak: number;
  totalFeesPrevented: number;
  tier: "free" | "pro" | "elite";
  onClose: () => void;
}

export default function FlexCard({ streak, totalFeesPrevented, tier, onClose }: FlexCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // In a real implementation, we would use html-to-image or html2canvas here.
    // For this mock, we will alert the user to take a screenshot natively.
    alert("In production, this triggers html2canvas to download a PNG. For now, take a screenshot of this gorgeous card!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-text-primary/50 hover:text-text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* The Card (Canvas Target) */}
        <div 
          ref={cardRef}
          className="w-full aspect-[4/5] rounded-[32px] overflow-hidden relative bg-background border border-border shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-success/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex flex-col h-full p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-auto">
              <span className="font-bold tracking-tighter text-xl text-text-primary font-mono">AEGIS.</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-hover border border-border text-[10px] font-mono text-text-primary uppercase tracking-widest">
                <Shield className="w-3 h-3 text-success" />
                {tier === 'elite' ? 'ELITE' : 'SECURED'}
              </div>
            </div>

            {/* Main Stat */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto">
              {streak > 0 ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-surface-hover border border-border flex items-center justify-center">
                    <span className="text-5xl">🔥</span>
                  </div>
                  <div>
                    <h1 className="text-6xl font-black tracking-tighter text-text-primary font-numeric">{streak}</h1>
                    <p className="text-sm text-text-muted font-mono uppercase tracking-widest mt-1">Day Streak</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-surface-hover border border-border flex items-center justify-center">
                    <Shield className="w-10 h-10 text-success" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter text-text-primary font-mono">ZERO</h1>
                    <p className="text-sm text-text-muted font-mono uppercase tracking-widest mt-1">Liabilities</p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Total Saved</p>
                  <p className="font-bold text-success text-xl font-numeric">£{totalFeesPrevented.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Status</p>
                  <p className="font-bold text-text-primary text-sm font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold" /> TOP 1%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full mt-8 flex flex-col gap-3">
          <Button fullWidth size="lg" onClick={handleDownload} className="font-mono uppercase tracking-widest text-xs">
            Save & Share to IG
          </Button>
          <p className="text-center text-xs text-text-muted font-mono">
            Show them how it's done.
          </p>
        </div>
      </div>
    </div>
  );
}
