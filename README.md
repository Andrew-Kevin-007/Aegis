<div align="center">
  <img src="https://raw.githubusercontent.com/Andrew-Kevin-007/Aegis/main/public/logo.png" alt="Aegis Logo" width="120" />
  <br/>
  <h1>Aegis</h1>
  <p>
    <strong>Automated BNPL exposure tracking and credit score protection.</strong>
  </p>
  
  <p>
    <a href="https://getaegis.app">Live Platform</a> •
    <a href="#overview">Overview</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#deployment">Deployment</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel" alt="Vercel" />
    <img src="https://img.shields.io/badge/Gemini-Pro_Vision-4285F4?style=flat-square&logo=google" alt="Gemini" />
  </p>
</div>

<br/>

## Overview

Under current global credit reporting standards (including FICO 10 and FCA regulations), "Buy Now, Pay Later" (BNPL) liabilities are treated as active credit lines. Missed payments on platforms such as Klarna, Afterpay, or Clearpay are reported to major bureaus, resulting in immediate and severe credit score degradation. 

Aegis is an intelligent, zero-trust financial monitoring platform. By leveraging Google's Gemini Vision architecture, Aegis processes user-uploaded screenshots of their BNPL applications to extract exact liability exposure, due dates, and provider details without requiring banking credentials. The platform acts proactively, dispatching scheduled alerts 48 hours prior to any due date to ensure absolute credit file protection.

## Core Capabilities

- **Frictionless Extraction**: Proprietary OCR pipeline via Gemini Pro Vision extracts complex financial data from static images in under 5 seconds.
- **Stateless Analysis**: The `/try` endpoint provides immediate value demonstration via in-memory processing without database persistence.
- **Credit Risk Modeling**: Dynamically calculates estimated FICO point degradation per specific missed liability.
- **Automated Lifecycle Hooks**: Vercel-driven cron architecture powers Day 1, Day 3, and Day 7 retention campaigns, alongside weekly exposure digests.
- **Viral Mechanics**: A fully integrated, automated referral engine ("Give Pro, Get Pro") leveraging Supabase triggers and Razorpay webhooks.

## Architecture

Aegis operates on a modern, highly scalable serverless infrastructure.

- **Client**: Next.js 14 App Router, React 18, TailwindCSS, Framer Motion.
- **Services**: Next.js Serverless Edge API Routes.
- **Data Layer**: Supabase (PostgreSQL) secured via rigorous Row Level Security (RLS) policies.
- **Authentication**: Supabase Auth utilizing passwordless OTP (Magic Links).
- **Payment Processing**: Razorpay Node SDK supporting multi-tier subscriptions.
- **Communications**: Resend for transactional and automated email delivery.

## Local Development

### Prerequisites

Ensure the following are provisioned prior to initialization:
- Node.js 18.x+
- Supabase Project credentials
- Razorpay API credentials
- Resend API Key
- Google AI Studio API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Andrew-Kevin-007/Aegis.git
   cd Aegis
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file at the root of the project with the following parameters:
   ```env
   # Core
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   
   # External Services
   GEMINI_API_KEY=
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   RAZORPAY_WEBHOOK_SECRET=
   RESEND_API_KEY=
   CRON_SECRET=
   ```

3. **Database Initialization**
   Execute the `supabase-schema.sql` script within your Supabase SQL Editor. This will automatically provision the necessary tables (`users`, `payments`), establish RLS policies, and configure the automated referral triggers.

4. **Initialize Development Environment**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Deployment

Aegis is explicitly engineered for deployment on Vercel. 

1. Push the repository to your version control provider.
2. Import the project into Vercel.
3. Supply the environment variables from your local configuration.
4. Vercel will automatically detect the `vercel.json` configuration and provision the required serverless cron jobs.

### Scheduled Processes (Crons)
- `/api/cron/alerts`: Executes daily at `08:00` to dispatch 48-hour liability warnings.
- `/api/cron/onboarding`: Executes daily at `10:00` to process the retention drip campaigns.
- `/api/cron/digest`: Executes weekly on Sundays at `10:00` to dispatch comprehensive exposure reports.

---
<div align="center">
  <sub>Aegis Platform Core 2026. All Rights Reserved.</sub>
</div>
