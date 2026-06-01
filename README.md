<div align="center">
  <img src="https://raw.githubusercontent.com/Andrew-Kevin-007/Aegis/main/public/logo.png" alt="Aegis Logo" width="120" />
  <br/>
  <h1>Aegis — The BNPL Credit Score Shield</h1>
  <p>
    <strong>AI-powered exposure tracking and automated protection for Buy Now, Pay Later (BNPL) liabilities.</strong>
  </p>
  <p>
    <a href="https://getaegis.app">Live Application</a> •
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

<br/>

## 🛡️ The Problem
Under new FICO 10 and global credit reporting standards (like the UK FCA regulations), "Buy Now, Pay Later" (BNPL) loans from providers like **Klarna, Afterpay, and Clearpay** are now treated as standard credit lines. A single missed payment of even £30 can be reported to major bureaus, potentially dropping a user's credit score by up to 40 points.

## ✨ The Solution
**Aegis** is an intelligent, zero-trust financial watchdog. Users upload a screenshot of their BNPL app, and our AI engine extracts their total exposure, due dates, and risk metrics in seconds. No bank login credentials or Plaid linking required. Aegis proactively alerts users 48 hours before any payment is due, ensuring their credit file remains pristine.

---

## 🚀 Features

- **Anonymous Scanning**: Try the product without creating an account via the `/try` route.
- **AI Screenshot OCR**: Extracts exact payment amounts, due dates, and provider details from screenshots in under 5 seconds using Google's Gemini Vision architecture.
- **The One-Number Dashboard**: A hyper-minimalist, urgency-sorted interface that color-codes total exposure and highlights critical risks.
- **Smart Alerts**: Automated 48-hour pre-due SMS and Email nudges powered by Vercel Crons.
- **FICO Impact Calculator**: Dynamically calculates the estimated point drop if a specific payment is missed.
- **Viral Referral Engine**: "Give Pro, Get Pro" loop tracking invites and automatically rewarding 30-day Pro extensions via Razorpay webhooks.
- **High-Converting Checkout**: 3-tiered subscription model (Monthly, Annual, Lifetime) processed seamlessly through Razorpay.

---

## ⚙️ Tech Stack & Architecture

Aegis is built for extreme speed, scalability, and minimal operational overhead.

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion
- **Backend**: Next.js Serverless API Routes, Vercel Edge Functions
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth (Passwordless Magic Links)
- **AI Extraction**: Google Gemini Pro Vision API
- **Payments**: Razorpay Node SDK
- **Transactional Emails**: Resend & React Email
- **Automation**: Vercel Cron Jobs

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.x or higher
- A Supabase Project
- A Razorpay Account
- A Resend Account
- A Google AI Studio API Key

### 1. Clone the repository
```bash
git clone https://github.com/Andrew-Kevin-007/Aegis.git
cd Aegis
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_custom_webhook_secret

# Resend
RESEND_API_KEY=your_resend_api_key

# Vercel Cron
CRON_SECRET=your_secure_cron_secret
```

### 3. Initialize the Database
Run the provided SQL schema in your Supabase SQL Editor to provision tables, RLS, and the referral engine triggers.
```bash
cat supabase-schema.sql # Copy the contents into Supabase
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Deployment

Aegis is optimized for Vercel deployment. 
1. Import the repository into Vercel.
2. Populate the Environment Variables in the Vercel Dashboard.
3. Deploy.
*(Vercel will automatically detect and configure the cron jobs defined in `vercel.json`)*.

---

## 📈 Automated Crons & Lifecycles
Aegis relies on a robust background architecture:
- **`0 8 * * *` (Daily Alerts)**: Scans for payments due in 48 hours and dispatches warnings.
- **`0 10 * * *` (Drip Campaigns)**: Day 1 Welcome, Day 3 Nudge, and Day 7 Conversion sequences.
- **`0 10 * * 0` (Sunday Digest)**: Compiles the user's weekly exposure and fees prevented into a beautiful summary email.

---

<div align="center">
  <sub>Built with precision and high-intent design.</sub>
</div>
