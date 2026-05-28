import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function CapabilitiesPage() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/solutions.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>
        <div className="relative z-10 container mx-auto max-w-4xl px-6 py-32 text-white text-center">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-sm font-semibold tracking-wider uppercase mb-6">
            Solutions
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Solutions
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed text-justify">
            End-to-end Technical Services from Requirements to Delivery
          </p>
        </div>
      </section>

      <section className="py-32 px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl font-bold text-text-primary mb-8">Capabilities</h1>
          <p className="text-xl text-text-secondary mb-20">
            End-to-end solutions powered by international expertise and robust quality systems
          </p>

          {/* R&D Expertise */}
          <section className="mb-24">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-text-primary mb-4">R&D Expertise</h2>
                <p className="text-xl text-text-secondary mb-6">
                  International expert network providing technical support and application solutions
                </p>
              </div>
            </div>
            <div className="pl-22">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Application Support</h3>
                  <p className="text-text-secondary">
                    Our R&D experts work directly with your team to develop customized solutions, optimize formulations, and troubleshoot technical challenges.
                  </p>
                </div>
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Formula Development</h3>
                  <p className="text-text-secondary">
                    From concept to commercialization, we support the entire product development process with technical expertise and market insights.
                  </p>
                </div>
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Ingredient Innovation</h3>
                  <p className="text-text-secondary">
                    Access to the latest ingredient innovations and emerging trends through our global research network.
                  </p>
                </div>
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Technical Training</h3>
                  <p className="text-text-secondary">
                    Knowledge transfer and training programs to help your team understand ingredient functionality and application best practices.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Supply Chain Management */}
          <section className="mb-24">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-brand-peach flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-2xl font-bold">2</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-text-primary mb-4">Supply Chain Management</h2>
                <p className="text-xl text-text-secondary mb-6">
                  Reliable logistics and inventory management ensuring consistent supply
                </p>
              </div>
            </div>
            <div className="pl-22">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Sourcing Excellence</h3>
                  <p className="text-text-secondary">
                    Direct relationships with premium dairy producers globally, ensuring quality and supply security.
                  </p>
                </div>
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Inventory Management</h3>
                  <p className="text-text-secondary">
                    Strategic warehousing and just-in-time delivery to optimize your inventory costs while ensuring supply continuity.
                  </p>
                </div>
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Logistics Coordination</h3>
                  <p className="text-text-secondary">
                    End-to-end logistics management from origin to destination, including customs clearance and regulatory compliance.
                  </p>
                </div>
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Supply Security</h3>
                  <p className="text-text-secondary">
                    Multiple sourcing options and contingency planning to mitigate supply chain risks.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quality Control */}
          <section className="mb-24">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-text-primary mb-4">Quality Control</h2>
                <p className="text-xl text-text-secondary mb-6">
                  Rigorous quality systems ensuring product safety and compliance
                </p>
              </div>
            </div>
            <div className="pl-22">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Certification Management</h3>
                  <p className="text-text-secondary">
                    Full certification support including organic, kosher, halal, and food safety standards (ISO, HACCP, FSSC).
                  </p>
                </div>
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Specification Compliance</h3>
                  <p className="text-text-secondary">
                    Strict adherence to product specifications with comprehensive testing and documentation.
                  </p>
                </div>
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Traceability</h3>
                  <p className="text-text-secondary">
                    Complete batch traceability from origin to delivery, ensuring transparency and accountability.
                  </p>
                </div>
                <div className="bg-bg-primary border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Regulatory Support</h3>
                  <p className="text-text-secondary">
                    Expert guidance on regulatory requirements for China, Southeast Asia, and international markets.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Process Overview */}
          <section className="bg-[#F8F8F8] p-12 rounded-xl">
            <h2 className="text-4xl font-bold text-text-primary mb-12 text-center">Our Process</h2>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-bold text-text-primary mb-2">Understand</h3>
                <p className="text-sm text-text-secondary">Identify requirements</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-bold text-text-primary mb-2">Source</h3>
                <p className="text-sm text-text-secondary">Select quality suppliers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-bold text-text-primary mb-2">Develop</h3>
                <p className="text-sm text-text-secondary">Customize solutions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="font-bold text-text-primary mb-2">Deliver</h3>
                <p className="text-sm text-text-secondary">Ensure timely logistics</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">5</span>
                </div>
                <h3 className="font-bold text-text-primary mb-2">Support</h3>
                <p className="text-sm text-text-secondary">Ongoing partnership</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  )
}
