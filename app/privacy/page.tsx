export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 font-mono">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm font-mono text-text-secondary space-y-6">
          <p>Last updated: June 2026</p>
          <section>
            <h2 className="text-white text-base">1. Data Collection</h2>
            <p>We collect email addresses for authentication and BNPL payment data (provider, amounts, due dates) to provide our service. Image scans are processed securely and are not permanently stored unless explicitly requested.</p>
          </section>
          <section>
            <h2 className="text-white text-base">2. Data Usage</h2>
            <p>Your data is used strictly to provide Aegis services, including generating health scores, alerts, and AI briefings. We do not sell your personal data or BNPL obligations to third parties.</p>
          </section>
          <section>
            <h2 className="text-white text-base">3. Your Rights (GDPR & CCPA)</h2>
            <p>You have the right to access, export, and delete your data at any time via the Profile page. You may also request the restriction of processing of your personal data.</p>
          </section>
          <section>
            <h2 className="text-white text-base">4. Security</h2>
            <p>Data is encrypted at rest and in transit. We utilize Supabase for secure authentication and database management.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
