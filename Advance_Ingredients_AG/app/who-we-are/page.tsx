import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function WhoWeArePage() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/AboutUs.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>
        <div className="relative z-10 container mx-auto max-w-4xl px-6 py-32 text-white text-center">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-sm font-semibold tracking-wider uppercase mb-6">
            About Us
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            About Us
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed text-justify">
            Swiss Quality · Integrity & Transparency · Professional Excellence
          </p>
        </div>
      </section>

      <section className="py-32 px-16">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-6xl font-bold text-text-primary mb-8">Who We Are</h1>
          <p className="text-xl text-text-secondary mb-16">
            A Swiss company committed to integrity, transparency, and excellence in dairy ingredients
          </p>
          <div className="space-y-16">
            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6">Our Story</h2>
              <p className="text-lg text-text-primary leading-relaxed mb-4 text-justify">
                Advance Ingredients AG is a Swiss company headquartered in Schaffhausen, founded in 2019.
              </p>
              <p className="text-lg text-text-primary leading-relaxed mb-4 text-justify">
                We specialize in dairy ingredient solutions, serving the infant formula, medical nutrition, and sports nutrition industries across China and Southeast Asia.
              </p>
              <p className="text-lg text-text-primary leading-relaxed text-justify">
                Our mission is to bridge the gap between premium dairy ingredient producers and the dynamic Asian market. Through our brands NEULINK, FOONEXUS, and LVEO, we deliver organic ingredients, whey proteins, and customized solutions.
              </p>
              <p className="text-lg text-text-primary leading-relaxed text-justify">
                We believe that trust is not a slogan—it's the result of consistent delivery over time. Our approach is built on reducing information asymmetry and creating transparent, efficient partnerships.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-8">Our Culture: Integrity & Transparency</h2>
              <p className="text-xl text-text-secondary mb-8">
                We believe trust is not a slogan but the result of consistent delivery over time.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-20 h-20 rounded-full bg-primary mb-4"></div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Speak the Truth</h3>
                  <p className="text-text-secondary">
                    No exaggeration or ambiguity regarding origins, specifications, lead times, or limitations. We provide clear, verifiable information.
                  </p>
                </div>
                <div>
                  <div className="w-20 h-20 rounded-full bg-brand-peach mb-4"></div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Share What Matters</h3>
                  <p className="text-text-secondary">
                    We proactively reduce information asymmetry, ensuring customers have the necessary information to make informed decisions.
                  </p>
                </div>
                <div>
                  <div className="w-20 h-20 rounded-full bg-primary mb-4"></div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Deliver Consistently</h3>
                  <p className="text-text-secondary">
                    Enabled by international R&D expert collaboration, supply chain management, and quality control.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-8">How We Work</h2>
              <p className="text-xl text-primary font-semibold mb-8">
                Need-oriented. Professional support. Delivery-focused.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Need-Oriented</h3>
                  <p className="text-text-secondary">
                    We listen first. Every solution begins with understanding your specific requirements.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Professional Support</h3>
                  <p className="text-text-secondary">
                    Our international R&D network provides technical expertise and application support.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Delivery-Focused</h3>
                  <p className="text-text-secondary">
                    On time, in spec, every time. Our supply chain management and quality control ensure reliability.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-brand-dark text-white py-16 px-8 rounded-xl">
              <h2 className="text-3xl font-bold mb-8">Key Facts</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Founded</p>
                  <p className="text-5xl font-bold text-primary">2019</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Headquarters</p>
                  <p className="text-3xl font-bold">Schaffhausen, Switzerland</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Market Focus</p>
                  <p className="text-3xl font-bold">China & Southeast Asia</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
