import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function MarketsPage() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/markets.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>
        <div className="relative z-10 container mx-auto max-w-4xl px-6 py-32 text-white text-center">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-sm font-semibold tracking-wider uppercase mb-6">
            Markets
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Market Coverage
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed text-justify">
            Serving China and Southeast Asia Markets
          </p>
        </div>
      </section>

      <section className="py-32 px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl font-bold text-text-primary mb-8">Markets</h1>
          <p className="text-xl text-text-secondary mb-20">
            Serving the dynamic markets of China and Southeast Asia with premium dairy ingredients
          </p>

          {/* Geographic Focus */}
          <section className="mb-24">
            <h2 className="text-4xl font-bold text-text-primary mb-8">Geographic Focus</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-bg-primary border-l-4 border-brand-red p-8 rounded-lg shadow-sm">
                <h3 className="text-3xl font-bold text-text-primary mb-4">China</h3>
                <p className="text-lg text-text-secondary mb-4">
                  The world's largest infant formula market with growing demand for premium ingredients
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Infant formula & specialized nutrition</li>
                  <li>• Sports nutrition market</li>
                  <li>• Clinical nutrition products</li>
                  <li>• Growing organic segment</li>
                </ul>
              </div>
              <div className="bg-bg-primary border-l-4 border-brand-green p-8 rounded-lg shadow-sm">
                <h3 className="text-3xl font-bold text-text-primary mb-4">Southeast Asia</h3>
                <p className="text-lg text-text-secondary mb-4">
                  Emerging markets with rising middle class and increasing health awareness
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Rapidly growing infant nutrition sector</li>
                  <li>• Expanding health & wellness market</li>
                  <li>• Increasing dairy consumption</li>
                  <li>• Demand for quality ingredients</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Industry Sectors */}
          <section className="mb-24">
            <h2 className="text-4xl font-bold text-text-primary mb-12">Industry Sectors</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#F8F8F8] p-8 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">Infant Formula</h3>
                <p className="text-text-secondary mb-4">
                  Complete ingredient solutions for infant formula, follow-on formula, and growing-up milk
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Standard & organic formulations</li>
                  <li>• Specialty ingredients (HMO, GOS)</li>
                  <li>• Nutrient premixes</li>
                </ul>
              </div>

              <div className="bg-[#F8F8F8] p-8 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-brand-green mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">Sports Nutrition</h3>
                <p className="text-text-secondary mb-4">
                  Performance proteins and recovery nutrition for active lifestyle and athletic markets
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Whey proteins (WPC80, WPI)</li>
                  <li>• Hydrolyzed proteins</li>
                  <li>• Custom formulations</li>
                </ul>
              </div>

              <div className="bg-[#F8F8F8] p-8 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-brand-blue mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">Medical Nutrition</h3>
                <p className="text-text-secondary mb-4">
                  Clinical nutrition products for special dietary requirements and medical conditions
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Elemental diets</li>
                  <li>• Specialist formulas</li>
                  <li>• Medical-grade ingredients</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Market Insights */}
          <section className="bg-brand-dark text-white p-12 rounded-xl">
            <h2 className="text-4xl font-bold mb-8">Market Insights</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-5xl font-bold text-primary mb-2">2020</h3>
                <p className="text-gray-300">China infant formula market size (USD billions)</p>
              </div>
              <div>
                <h3 className="text-5xl font-bold text-brand-peach mb-2">15%</h3>
                <p className="text-gray-300">Annual growth in premium segment</p>
              </div>
              <div>
                <h3 className="text-5xl font-bold text-primary mb-2">8%</h3>
                <p className="text-gray-300">CAGR SEA nutrition market</p>
              </div>
            </div>
          </section>

          {/* Our Presence */}
          <section className="mt-24">
            <h2 className="text-4xl font-bold text-text-primary mb-8">Local Presence, Global Reach</h2>
            <p className="text-xl text-text-secondary mb-8 max-w-4xl">
              Headquartered in Switzerland with strong local presence across China and Southeast Asia.
              We combine Swiss quality standards with deep market understanding and local expertise.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-bg-primary border border-gray-200 p-6 rounded-lg">
                <h3 className="font-bold text-text-primary mb-2">Swiss HQ</h3>
                <p className="text-text-secondary text-sm">Quality oversight & strategic direction</p>
              </div>
              <div className="bg-bg-primary border border-gray-200 p-6 rounded-lg">
                <h3 className="font-bold text-text-primary mb-2">China Operations</h3>
                <p className="text-text-secondary text-sm">Local sales, technical support & logistics</p>
              </div>
              <div className="bg-bg-primary border border-gray-200 p-6 rounded-lg">
                <h3 className="font-bold text-text-primary mb-2">SEA Network</h3>
                <p className="text-text-secondary text-sm">Growing presence across key markets</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  )
}
