"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, User, Palette, Shield, CreditCard, Gift, LogOut } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const navItems = [
    { label: "Account", path: "/settings", icon: <User className="w-4 h-4" /> },
    { label: "Appearance", path: "/settings/appearance", icon: <Palette className="w-4 h-4" /> },
    { label: "Security", path: "/settings/security", icon: <Shield className="w-4 h-4" /> },
    { label: "Billing", path: "/settings/billing", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Referrals", path: "/settings/referrals", icon: <Gift className="w-4 h-4" /> },
  ];

  const handleSignOut = async () => {
    // Implement sign out
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden h-16 border-b border-border flex items-center px-6 bg-surface/60 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => router.push("/dashboard")} className="text-text-muted hover:text-text-primary transition-colors mr-4">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold tracking-tighter font-mono uppercase">Settings</span>
      </header>

      {/* Sidebar (Desktop) / Horizontal Scroll (Mobile) */}
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-border bg-surface p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar md:h-screen md:sticky md:top-0 shrink-0">
        <div className="hidden md:flex items-center mb-8 px-2 cursor-pointer group" onClick={() => router.push("/dashboard")}>
          <ChevronLeft className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors mr-2" />
          <span className="font-mono text-xs uppercase tracking-widest text-text-muted group-hover:text-text-primary transition-colors">Back to Dash</span>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-3 px-4 py-3 md:py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                isActive ? "bg-primary text-primary-inverse font-medium" : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}

        <div className="hidden md:block mt-auto pt-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-3xl">
        {children}
      </main>
    </div>
  );
}
