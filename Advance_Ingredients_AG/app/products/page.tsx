import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function ProductsPage() {
  return (
    <>
      <Header />
      <section className="py-32 px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl font-bold text-text-primary mb-8">Products</h1>
          <p className="text-xl text-text-secondary mb-16">
            Comprehensive dairy ingredient portfolio across three specialized brands
          </p>

          {/* FOONEXUS Products */}
          <section className="mb-20 bg-[#F8F8F8] -mx-16 px-16 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand-green px-6 py-3 rounded">
                  <span className="text-lg font-bold text-white">FOONEXUS</span>
                </div>
                <h2 className="text-4xl font-bold text-text-primary">Organic Ingredients</h2>
              </div>
              <p className="text-lg text-text-secondary mb-8 max-w-3xl">
                Certified organic ingredients for infant formula and health products. Full traceability from farm to finish.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-bg-primary p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Organic Lactose</h3>
                  <p className="text-text-secondary text-sm">EU & USDA certified</p>
                </div>
                <div className="bg-bg-primary p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Organic D90</h3>
                  <p className="text-text-secondary text-sm">Spray-dried permeate</p>
                </div>
                <div className="bg-bg-primary p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Organic WPC</h3>
                  <p className="text-text-secondary text-sm">Various protein levels</p>
                </div>
                <div className="bg-bg-primary p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Organic GOS</h3>
                  <p className="text-text-secondary text-sm">Prebiotic fiber</p>
                </div>
              </div>
            </div>
          </section>

          {/* LVEO Products */}
          <section className="mb-20 bg-[#F8F8F8] -mx-16 px-16 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand-blue px-6 py-3 rounded">
                  <span className="text-lg font-bold text-white">LVEO</span>
                </div>
                <h2 className="text-4xl font-bold text-text-primary">Whey Proteins</h2>
              </div>
              <p className="text-lg text-text-secondary mb-8 max-w-3xl">
                Premium whey proteins for sports nutrition, clinical nutrition, and specialized formula applications.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-bg-primary p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-3">WPC80</h3>
                  <p className="text-text-secondary mb-4">80% protein concentrate</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Instant and standard forms</li>
                    <li>• Various flavor options</li>
                    <li>• Excellent solubility</li>
                  </ul>
                </div>
                <div className="bg-bg-primary p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-3">WPI</h3>
                  <p className="text-text-secondary mb-4">90%+ protein isolate</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Ultra-pure protein</li>
                    <li>• Low fat and lactose</li>
                    <li>• Rapid absorption</li>
                  </ul>
                </div>
                <div className="bg-bg-primary p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-text-primary mb-3">Hydrolyzed WPC80</h3>
                  <p className="text-text-secondary mb-4">Partially hydrolyzed</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Easy digestion</li>
                    <li>• Reduced allergenicity</li>
                    <li>• Medical nutrition grade</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* NEULINK Custom Solutions */}
          <section className="mb-20 bg-bg-primary -mx-16 px-16 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary px-6 py-3 rounded">
                  <span className="text-lg font-bold text-white">NEULINK</span>
                </div>
                <h2 className="text-4xl font-bold text-text-primary">Custom Solutions</h2>
              </div>
              <div className="bg-[#F8F8F8] border border-gray-200 p-8 rounded-lg max-w-3xl">
                <p className="text-lg text-text-secondary">
                  Tailored ingredient solutions designed to meet your specific requirements. From specification to application, we provide end-to-end support.
                </p>
              </div>
            </div>
          </section>

          {/* Applications */}
          <section>
            <h2 className="text-4xl font-bold text-text-primary mb-8">Applications</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-brand-peach/30 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-text-primary mb-3">Infant Formula</h3>
                <p className="text-text-secondary">
                  Complete ingredient solutions for infant formula and follow-on formula
                </p>
              </div>
              <div className="bg-brand-peach/30 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-text-primary mb-3">Sports Nutrition</h3>
                <p className="text-text-secondary">
                  Performance and recovery proteins for active lifestyle and athletic applications
                </p>
              </div>
              <div className="bg-brand-peach/30 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-text-primary mb-3">Medical Nutrition</h3>
                <p className="text-text-secondary">
                  Clinical nutrition products for special dietary and medical requirements
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  )
}
