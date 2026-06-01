export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 font-mono">Terms of Service</h1>
        <div className="prose prose-invert prose-sm font-mono text-text-secondary space-y-6">
          <p>Last updated: June 2026</p>
          <section>
            <h2 className="text-white text-base">1. Acceptance of Terms</h2>
            <p>By accessing or using Aegis, you agree to be bound by these Terms of Service. Aegis is a financial management tool and does not provide financial or legal advice.</p>
          </section>
          <section>
            <h2 className="text-white text-base">2. Service Description</h2>
            <p>Aegis provides tools to track and manage Buy Now, Pay Later (BNPL) obligations. We process images locally or securely via OCR APIs to extract payment data.</p>
          </section>
          <section>
            <h2 className="text-white text-base">3. User Responsibilities</h2>
            <p>You are responsible for the accuracy of the data you input or scan into Aegis. Aegis is not liable for missed payments, late fees, or credit score damage resulting from inaccurate data or failure to act on alerts.</p>
          </section>
          <section>
            <h2 className="text-white text-base">4. Subscription and Billing</h2>
            <p>Aegis Pro subscriptions are billed in advance. You may cancel at any time. Refunds are provided only as required by local consumer law.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
