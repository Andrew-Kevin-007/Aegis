"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowRight, ShieldCheck, Zap, Activity, TrendingDown, ChevronDown } from "lucide-react";
import { useState } from "react";

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-4">
      <button 
        onClick={() => setOpen(!open)} 
        className="flex w-full justify-between items-center text-left"
      >
        <span className="font-medium text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="mt-4 text-text-secondary leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl z-50 flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
          <span className="font-bold tracking-tighter text-lg">Aegis.</span>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log In</Button>
            </Link>
            <Link href="/try">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — FICO-first narrative for Gen Z */}
      <section className="pt-40 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-danger/20 bg-danger/5 mb-8 font-mono text-[11px] uppercase tracking-widest text-danger"
        >
          <TrendingDown className="w-3 h-3" />
          FICO now scores BNPL payments
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-semibold tracking-tighter max-w-4xl leading-[1.05]"
        >
          Aegis reads your BNPL screenshots and shows you what you owe.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-text-secondary mt-6 max-w-2xl"
        >
          Your Klarna and Afterpay payments now affect your credit score. 
          We make sure they don&apos;t damage it. Scan a screenshot, track your liabilities, and never pay a late fee again.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-md"
        >
          <Link href="/try" className="w-full">
            <Button size="lg" fullWidth icon={<ArrowRight className="w-4 h-4" />}>
              Try it now — no signup needed
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 flex items-center justify-center flex-wrap gap-4 sm:gap-8 text-text-muted font-mono text-xs uppercase tracking-widest"
        >
          <span>Klarna</span>
          <span className="w-px h-4 bg-white/10" />
          <span>Afterpay</span>
          <span className="w-px h-4 bg-white/10" />
          <span>Clearpay</span>
          <span className="w-px h-4 bg-white/10 hidden sm:block" />
          <span className="hidden sm:inline">Zero Bank Syncing</span>
        </motion.div>

      </section>

      {/* How it works */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">How Aegis Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5">
            <div className="text-text-muted font-mono text-sm mb-4">01</div>
            <h3 className="text-xl font-medium mb-2">Upload a screenshot</h3>
            <p className="text-text-secondary text-sm">
              Take a screenshot of your BNPL app. No need to connect your bank account or share sensitive credentials.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5">
            <div className="text-text-muted font-mono text-sm mb-4">02</div>
            <h3 className="text-xl font-medium mb-2">See what you owe</h3>
            <p className="text-text-secondary text-sm">
              Our intelligent engine extracts your due dates and amounts instantly. We even calculate the potential credit score impact if you miss a payment.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5">
            <div className="text-text-muted font-mono text-sm mb-4">03</div>
            <h3 className="text-xl font-medium mb-2">Get 48-hour alerts</h3>
            <p className="text-text-secondary text-sm">
              Aegis sends you an SMS and email 48 hours before any payment is due, ensuring your credit file stays pristine.
            </p>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-t border-white/5 py-24 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <ShieldCheck className="w-8 h-8 mb-6 text-white" />
            <h3 className="text-2xl font-medium tracking-tight mb-3">Credit Shield</h3>
            <p className="text-text-secondary leading-relaxed">
              BNPL late payments are now reported to credit bureaus under FICO 10. A single missed Klarna payment can lower your score by up to 40 points.
            </p>
          </div>
          <div>
            <Zap className="w-8 h-8 mb-6 text-white" />
            <h3 className="text-2xl font-medium tracking-tight mb-3">Smart Alerts</h3>
            <p className="text-text-secondary leading-relaxed">
              Never forget a payment again. Aegis acts as your personal financial watchdog, keeping track of scattered BNPL liabilities across multiple apps.
            </p>
          </div>
          <div>
            <Activity className="w-8 h-8 mb-6 text-white" />
            <h3 className="text-2xl font-medium tracking-tight mb-3">Screenshot Intelligence</h3>
            <p className="text-text-secondary leading-relaxed">
              Zero bank linking required. Snap your screen and Aegis reads the data in under 5 seconds. Radical simplicity and maximum privacy.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-2">
          <FaqItem 
            question="Why not just link my bank account?" 
            answer="Because you shouldn't have to give away the keys to your financial life just to track some payments. Aegis works via screenshots—meaning we have zero access to your actual bank data. It's the most private way to manage your exposure." 
          />
          <FaqItem 
            question="Does BNPL really affect my credit score?" 
            answer="Yes. As of recent FICO 10 updates and UK FCA regulations, 'Buy Now, Pay Later' loans are now treated like standard credit. On-time payments can help, but a single missed payment is reported to major bureaus and can severely damage your score." 
          />
          <FaqItem 
            question="How does Aegis make money?" 
            answer="We believe in radical transparency. Aegis offers a Free tier with 3 manual scans per day. We make money through our Pro subscription (£9.99/mo), which gives you unlimited scans and automated 48-hour alerts. We don't sell your data, and we don't show you ads." 
          />
          <FaqItem 
            question="What providers do you support?" 
            answer="Aegis currently supports major BNPL providers including Klarna, Afterpay, and Clearpay, and our intelligent extraction engine can often understand others directly from the screenshot context." 
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="font-bold tracking-tighter">Aegis.</span>
            <span className="text-text-muted text-xs">The BNPL Credit Score Shield</span>
          </div>
          <div className="flex gap-6 text-text-muted text-xs font-mono uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="mailto:support@getaegis.app" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
