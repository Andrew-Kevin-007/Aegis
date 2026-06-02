# Aegis: The Apex Tier BNPL Debt Shield 🛡️

Aegis is a hyper-personalized, next-generation financial operating system built to shield your credit score from the hidden dangers of Buy Now, Pay Later (BNPL) debt. 

Built with the core philosophy that **debt tracking shouldn't be boring**, Aegis combines encrypted security, real-time AI OCR extraction, and gamified "Duolingo-style" behavioral nudges to transform financial anxiety into a competitive advantage.

---

## 🚀 The Vision: Why Aegis Exists

The modern consumer is trapped in a fragmented web of Klarna, Afterpay, and Clearpay loans. With regulations changing globally, a single missed BNPL payment can now decimate a user's credit score. 

Aegis exists to:
1. **Unify** all active BNPL liabilities into a single "Debt Shield" via an AI-powered screenshot scanner.
2. **Protect** the user's credit file with 48-hour priority SMS alerts before a payment defaults.
3. **Automate** wealth creation via the Auto-Wealth Engine—taking the money you *would* have spent on a late fee and automatically routing it into an S&P 500 index fund.

---

## 💎 Core Features & Architecture

### 1. The Adaptive UI Engine (Next-Themes)
Aegis V2 drops the rigid dark-mode standard for an **Adaptive Clarity Engine**.
- **Cyberpunk Dark**: A high-density, terminal-inspired environment for the power user.
- **Adaptive Light**: A pristine, off-white (Apple Card inspired) UI designed to reduce cognitive load and display complex financial data cleanly.
Built on Tailwind CSS variables, toggling between modes is instant and flicker-free.

### 2. The GlobalKat: Your Roaming AI Companion
Move over, static chatbots. Aegis introduces **GlobalKat**—a `fixed`-position Framer Motion DOM pet that literally roams across your screen.
- **Context-Aware**: GlobalKat calculates the bounds of your UI elements. It will physically jump onto your "Total Liability" number, sleep on your navigation bar, and follow your cursor.
- **Dynamic Personality (Roast vs. Hype Mode)**: Choose your AI's tone in the Settings app. Want brutally honest financial roasting (Cleo style)? Choose *Roast Mode*. Prefer gentle behavioral nudges? Choose *Hype Mode*. Your companion will issue timely speech bubbles as it roams.

### 3. The Centralized Control Room (Settings App)
The monolithic `/profile` page has been destroyed in favor of a sleek, multi-tab `/settings` application structure:
- **Account**: Manage your identity and name your AI companion.
- **Appearance**: Toggle Adaptive Light or Cyberpunk Dark. Change your companion's tone.
- **Security & Privacy**: View real-time active sessions. Perform AES-256 database audits. Export or Nuke your encrypted data under GDPR compliance.
- **Refer & Earn**: A dynamic referral engine. Give your unique link (`aegis.app/join/[your-name]`) and automatically earn £10 when your friend settles their first bill.

### 4. AI-Powered OCR & Manual Liability Entry
- **The AI Scanner**: Upload a screenshot of your Klarna app. Aegis uses `gemini-1.5-flash-latest` via serverless Edge Functions to extract provider names, amounts, and due dates in under 3 seconds.
- **The Manual Shield**: If the OCR fails, users are never trapped. The *Manual Entry Modal* allows you to manually inject a liability straight into your active Aegis Shield.

### 5. Multi-Player Accountability Squads
Financial discipline is a team sport. Aegis features **Debt-Free Pods** where users can link up with friends.
- View collective health scores.
- Trigger Framer Motion confetti when your squad prevents late fees together.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + CSS Variables + `next-themes`
- **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + GoTrue Auth)
- **AI / LLM**: Google Gemini API (`gemini-1.5-flash-latest`) for both OCR extraction and behavioral report generation.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (Core engine behind the GlobalKat and micro-interactions)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/aegis.git
   cd aegis
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Initialize Supabase Schema**
   Run the provided SQL in your Supabase SQL Editor:
   ```bash
   # See supabase-schema.sql for the complete table, RLS, and type definitions.
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view your Aegis Dashboard.

---

## 🔒 Security & Privacy (The Aegis Promise)
We are building a credit shield, not a data broker.
- All BNPL screenshots are processed directly in memory via Google Gemini and are **immediately discarded**. Images are never saved to an S3 bucket or local storage.
- All stored liability data (amounts, providers) are secured via Supabase Row Level Security (RLS). A user can only fetch their own decrypted rows via Edge-authenticated API calls.

---

*Designed and engineered for the modern borrower. Keep your credit score spotless. Stay ahead of the algorithm.*
