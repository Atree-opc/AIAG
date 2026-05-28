import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function BrandsPage() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/brands-products.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>
        <div className="relative z-10 container mx-auto max-w-4xl px-6 py-32 text-white text-center">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-sm font-semibold tracking-wider uppercase mb-6">
            Brands & Products
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Brands & Products
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed text-justify">
            Three Brands · Comprehensive Solutions
          </p>
        </div>
      </section>

      <section className="py-32 px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl font-bold text-text-primary mb-8">Our Brands</h1>
          <p className="text-xl text-text-secondary">
            Three specialized brands delivering comprehensive dairy ingredient solutions
          </p>
        </div>
      </section>

      {/* NEULINK Section */}
      <section className="py-16 px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-8 mb-8">
            <div className="w-32">
              <img src="/NEULINK-logo.png" alt="NEULINK" className="w-full h-auto object-contain" />
            </div>
            <h2 className="text-5xl font-bold text-text-primary">Trusted Connections</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-lg text-text-primary leading-relaxed mb-4 text-justify">
                Our proprietary ingredient brand built on the principle of reducing information asymmetry.
                NEULINK embodies our core philosophy: Linking Trust. Creating Value.
              </p>
              <p className="text-lg text-text-primary leading-relaxed text-justify">
                Through transparent connections and honest communication, we create efficient, value-added
                solutions tailored to our customers' specific needs.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary">Key Features:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-text-primary">Custom solutions based on customer needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-text-primary">Transparent sourcing and specifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-text-primary">Application support from R&D network</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOONEXUS Section */}
      <section className="bg-[#F8F8F8] py-16 px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-8 mb-8">
            <div className="w-32">
              <img src="/FOONEXUS-logo.png" alt="FOONEXUS" className="w-full h-auto object-contain" />
            </div>
            <h2 className="text-5xl font-bold text-text-primary">Organic Excellence</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-lg text-text-primary leading-relaxed mb-4 text-justify">
                Our specialized organic product line serving the growing demand for certified organic ingredients
                in infant nutrition and health products.
              </p>
              <p className="text-lg text-text-primary leading-relaxed text-justify">
                FOONEXUS represents our commitment to sustainable, traceable organic ingredients. Every product
                maintains full certification and meets the strictest organic standards.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Product Portfolio:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span className="text-text-primary">Organic Lactose</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span className="text-text-primary">Organic D90</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span className="text-text-primary">Organic WPC</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span className="text-text-primary">Organic GOS</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* LVEO Section */}
      <section className="py-16 px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-8 mb-8">
            <div className="w-32">
              <img src="/LVEO-logo.jpg" alt="LVEO" className="w-full h-auto object-contain" />
            </div>
            <h2 className="text-5xl font-bold text-text-primary">Protein Innovation</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-lg text-text-primary leading-relaxed mb-4 text-justify">
                Premium whey protein line with leading market influence in China's protein sector.
                LVEO delivers high-quality ingredients for performance and recovery nutrition.
              </p>
              <p className="text-lg text-text-primary leading-relaxed text-justify">
                Our whey proteins are sourced from premium suppliers and processed to maintain optimal
                nutritional value and functional properties. LVEO serves sports nutrition, clinical nutrition, and specialized formula markets.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Product Portfolio:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                  <span className="text-text-primary">WPC80</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                  <span className="text-text-primary">WPI</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                  <span className="text-text-primary">Hydrolyzed WPC80</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Comparison */}
      <section className="bg-[#FAFAFA] py-16 px-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-text-primary mb-12">Brand Overview</h2>
          <div className="space-y-4">
            <div className="bg-bg-primary p-8 rounded-lg shadow-sm">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <span className="text-primary font-bold text-lg">NEULINK</span>
                </div>
                <div className="text-text-primary">Custom Solutions</div>
                <div className="text-text-secondary">Tailored solutions, application support</div>
              </div>
            </div>
            <div className="bg-bg-primary p-8 rounded-lg shadow-sm">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <span className="text-brand-green font-bold text-lg">FOONEXUS</span>
                </div>
                <div className="text-text-primary">Organic Ingredients</div>
                <div className="text-text-secondary">Organic Lactose, D90, WPC, GOS</div>
              </div>
            </div>
            <div className="bg-bg-primary p-8 rounded-lg shadow-sm">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <span className="text-brand-blue font-bold text-lg">LVEO</span>
                </div>
                <div className="text-text-primary">Whey Proteins</div>
                <div className="text-text-secondary">WPC80, WPI, Hydrolyzed WPC80</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-24 px-16 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl font-bold text-white mb-6">Find Your Solution</h2>
          <p className="text-xl text-white opacity-90 mb-10">
            Explore our product portfolio or contact us for customized solutions
          </p>
          <a
            href="/products"
            className="inline-block bg-bg-primary text-primary px-12 py-5 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Products
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
