import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Header />
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Terms of Service</h1>
          <p className="text-sm text-text-muted mb-12">Last updated: January 2025</p>

          <div className="space-y-10 text-text-primary">

            <div>
              <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p className="text-text-secondary leading-relaxed">
                By accessing or using the website of Advance Ingredients AG ("we", "us", or "our"), located at advance-ingredients.ch, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this website. These terms apply to all visitors and users of the site.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">2. Nature of the Website</h2>
              <p className="text-text-secondary leading-relaxed">
                This website is a B2B information and inquiry platform operated by Advance Ingredients AG, a Swiss company specialising in dairy ingredient solutions. The content is intended for business professionals in the food, nutrition, and ingredient industries. Nothing on this website constitutes a binding offer or contract unless explicitly confirmed in writing by Advance Ingredients AG.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">3. Intellectual Property</h2>
              <p className="text-text-secondary leading-relaxed">
                All content on this website — including text, images, logos, brand names (NEULINK, FOONEXUS, LVEO), graphics, and design — is the property of Advance Ingredients AG or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content without our prior written consent.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">4. Use of the Website</h2>
              <p className="text-text-secondary leading-relaxed mb-3">You agree to use this website only for lawful purposes. You must not:</p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>Use the site in any way that violates applicable laws or regulations</li>
                <li>Attempt to gain unauthorised access to any part of the site or its systems</li>
                <li>Transmit any unsolicited commercial communications</li>
                <li>Submit false or misleading information through any contact form</li>
                <li>Interfere with the proper functioning of the website</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">5. Product Information</h2>
              <p className="text-text-secondary leading-relaxed">
                Product descriptions, specifications, and availability listed on this website are for informational purposes only and are subject to change without notice. All commercial terms, pricing, and delivery conditions are subject to separate written agreements. We make no warranty that product information is complete, accurate, or current at all times.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">6. Disclaimer of Warranties</h2>
              <p className="text-text-secondary leading-relaxed">
                This website is provided on an "as is" and "as available" basis without any warranties of any kind, express or implied. We do not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components. To the fullest extent permitted by law, we disclaim all warranties in connection with the website and its content.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">7. Limitation of Liability</h2>
              <p className="text-text-secondary leading-relaxed">
                To the maximum extent permitted by applicable law, Advance Ingredients AG shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, this website or its content. Our total liability for any claim arising in connection with this website shall not exceed CHF 100.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">8. Third-Party Links</h2>
              <p className="text-text-secondary leading-relaxed">
                This website may contain links to third-party websites for your convenience. We have no control over the content or practices of those sites and accept no responsibility for them. Linking to a third-party site does not imply endorsement by Advance Ingredients AG.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">9. Governing Law</h2>
              <p className="text-text-secondary leading-relaxed">
                These Terms of Service are governed by and construed in accordance with the laws of Switzerland, without regard to its conflict of law provisions. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Schaffhausen, Switzerland.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">10. Changes to These Terms</h2>
              <p className="text-text-secondary leading-relaxed">
                We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated date. Your continued use of the website after any changes constitutes your acceptance of the revised terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">11. Contact</h2>
              <p className="text-text-secondary leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
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
