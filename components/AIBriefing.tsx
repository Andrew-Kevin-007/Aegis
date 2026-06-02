"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Cpu, RefreshCw } from "lucide-react";
import type { DBPayment } from "@/lib/database.types";

interface AIBriefingProps {
  payments: DBPayment[];
  tier: "free" | "pro" | "elite";
}

export default function AIBriefing({ payments, tier }: AIBriefingProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [typed, setTyped] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    if (payments.length > 0) fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!report) return;
    setTyped("");
    setCharIdx(0);
  }, [report]);

  useEffect(() => {
    if (!report || charIdx >= report.length) return;
    const timeout = setTimeout(() => {
      setTyped(report.slice(0, charIdx + 1));
      setCharIdx(c => c + 1);
    }, 12);
    return () => clearTimeout(timeout);
  }, [charIdx, report]);

  const fetchReport = async (force = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payments }),
      });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
        setCached(data.cached);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (payments.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/5 bg-[#020202] overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Cpu className="w-4 h-4 text-text-muted" />
          <span className="font-mono text-xs uppercase tracking-widest text-text-secondary">
            AI Briefing
          </span>
          {cached && (
            <span className="font-mono text-[9px] text-text-muted bg-white/5 px-2 py-0.5 rounded">
              CACHED
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-5">
              {loading && !report ? (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="font-mono text-xs text-text-muted">Analysing your exposure...</span>
                </div>
              ) : report ? (
                <>
                  <pre className="font-mono text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                    {typed}
                    {charIdx < report.length && (
                      <span className="inline-block w-0.5 h-3 bg-white/60 animate-pulse ml-0.5" />
                    )}
                  </pre>
                  {charIdx >= report.length && (
                    <button
                      onClick={() => fetchReport(true)}
                      disabled={loading}
                      className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-white transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                      Refresh analysis
                    </button>
                  )}

                  {/* Elite Predictive Burn Rate */}
                  {tier === "elite" && charIdx >= report.length && (
                    <div className="mt-6 border-t border-white/5 pt-4">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-gold flex items-center gap-2 mb-3">
                        <Cpu className="w-3 h-3" /> Predictive Cashflow (Elite)
                      </p>
                      <div className="bg-black/50 border border-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-end mb-2">
                          <p className="font-mono text-xs text-white">Estimated Burn Rate</p>
                          <p className="font-mono text-[10px] text-danger">14 Days to Default Risk</p>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-success via-warning to-danger w-[85%]" />
                        </div>
                        <p className="font-mono text-[9px] text-text-muted mt-2 leading-relaxed">
                          At current spending velocity based on connected mock accounts, you may lack liquidity for upcoming Klarna/Afterpay liabilities. Action recommended.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="font-mono text-xs text-text-muted">Unable to generate report. Try again.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
