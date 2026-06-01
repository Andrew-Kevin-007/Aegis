import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import ReferralTracker from "@/components/ReferralTracker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aegis — BNPL Credit Score Shield",
  description:
    "Aegis reads your BNPL screenshots and tells you what you owe. Your Klarna, Afterpay, and Simpl payments now affect your credit score. We make sure they don't damage it.",
  keywords: [
    "BNPL",
    "credit score",
    "Klarna",
    "Afterpay",
    "Clearpay",
    "buy now pay later",
    "credit protection",
    "FICO",
    "CIBIL",
    "late fees",
  ],
  openGraph: {
    title: "Aegis — BNPL Credit Score Shield",
    description:
      "Your BNPL payments now affect your credit score. Aegis makes sure they don't damage it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
