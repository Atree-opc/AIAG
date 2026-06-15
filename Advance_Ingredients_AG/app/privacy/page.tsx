import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Privacy Policy</h1>
          <p className="text-sm text-text-muted mb-12">Last updated: January 2025</p>

          <div className="space-y-10 text-text-primary">

            <div>
              <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
              <p className="text-text-secondary leading-relaxed">
                Advance Ingredients AG ("we", "us", or "our"), headquartered in Schaffhausen, Switzerland, is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard information when you visit our website or contact us for business purposes. We comply with the Swiss Federal Act on Data Protection (FADP) and, where applicable, the EU General Data Protection Regulation (GDPR).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">2. Data We Collect</h2>
              <p className="text-text-secondary leading-relaxed mb-3">We may collect the following personal data:</p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>Name and job title</li>
                <li>Company name and business address</li>
                <li>Email address and phone number</li>
                <li>Country or region</li>
                <li>Inquiry details (products, volumes, requirements)</li>
                <li>Technical data such as IP address and browser type (collected automatically)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">3. How We Use Your Data</h2>
              <p className="text-text-secondary leading-relaxed mb-3">We use your personal data solely for the following purposes:</p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>Responding to your business inquiries</li>
                <li>Providing product information and quotations</li>
                <li>Managing our business relationship with you</li>
                <li>Improving our website and services</li>
                <li>Complying with legal obligations</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-3">
                We do not use your data for automated decision-making or profiling, and we do not sell your personal data to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">4. Legal Basis for Processing</h2>
              <p className="text-text-secondary leading-relaxed">
                We process your personal data on the basis of your consent (when you submit a contact form), the performance of a contract or pre-contractual measures, and our legitimate business interests in responding to inquiries and maintaining business relationships.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">5. Data Retention</h2>
              <p className="text-text-secondary leading-relaxed">
                We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law. Business correspondence is typically retained for up to 10 years in accordance with Swiss commercial law.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">6. Data Sharing</h2>
              <p className="text-text-secondary leading-relaxed">
                We do not share your personal data with third parties except where necessary to fulfil your request (e.g., logistics partners, technical service providers), or where required by law. Any third parties we engage are contractually bound to handle your data in accordance with applicable data protection laws.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">7. International Transfers</h2>
              <p className="text-text-secondary leading-relaxed">
                As we operate across Switzerland, China, and Southeast Asia, your data may be transferred to and processed in countries outside the European Economic Area. We ensure appropriate safeguards are in place for any such transfers, including standard contractual clauses where required.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">8. Your Rights</h2>
              <p className="text-text-secondary leading-relaxed mb-3">Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-3">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:info@advance-ingredients.ch" className="text-primary hover:underline">
                  info@advance-ingredients.ch
                </a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">9. Cookies</h2>
              <p className="text-text-secondary leading-relaxed">
                Our website uses only essential technical cookies necessary for the site to function. We do not use tracking or advertising cookies. No cookie consent banner is required for essential cookies under applicable law.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">10. Contact</h2>
              <p className="text-text-secondary leading-relaxed">
                For any questions regarding this Privacy Policy or our data practices, please contact:
              </p>
              <div className="mt-3 text-text-secondary space-y-1">
                <p className="font-medium text-text-primary">Advance Ingredients AG</p>
                <p>Schaffhausen, Switzerland</p>
                <p>
                  <a href="mailto:info@advance-ingredients.ch" className="text-primary hover:underline">
                    info@advance-ingredients.ch
                  </a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
