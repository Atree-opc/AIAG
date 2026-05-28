#!/bin/bash
# Script to create all remaining pages for Advance Ingredients AG website

# Create directories
mkdir -p app/who-we-are app/brands app/products app/capabilities app/markets app/contact

echo "Creating all 6 remaining pages..."

# Create Who We Are page
cat > app/who-we-are/page.tsx << 'EOF'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function WhoWeArePage() {
  return (
    <>
      <Header />
      <section className="py-32 px-16">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">Who We Are</h1>
          <p className="text-xl text-gray-600 mb-16">
            A Swiss company committed to integrity, transparency, and excellence in dairy ingredients
          </p>
          <div className="space-y-16">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Advance Ingredients AG is a Swiss company headquartered in Schaffhausen, founded in 2019.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We specialize in dairy ingredient solutions, serving the infant formula, medical nutrition, and sports nutrition industries across China and Southeast Asia.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our mission is to bridge the gap between premium dairy ingredient producers and the dynamic Asian market. Through our brands NEULINK, FOONEXUS, and LVEO, we deliver organic ingredients, whey proteins, and customized solutions.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe that trust is not a slogan—it's the result of consistent delivery over time. Our approach is built on reducing information asymmetry and creating transparent, efficient partnerships.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Culture: Integrity & Transparency</h2>
              <p className="text-xl text-gray-600 mb-8">
                We believe trust is not a slogan but the result of consistent delivery over time.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-20 h-20 rounded-full bg-brand-red mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Speak the Truth</h3>
                  <p className="text-gray-600">
                    No exaggeration or ambiguity regarding origins, specifications, lead times, or limitations. We provide clear, verifiable information.
                  </p>
                </div>
                <div>
                  <div className="w-20 h-20 rounded-full bg-brand-peach mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Share What Matters</h3>
                  <p className="text-gray-600">
                    We proactively reduce information asymmetry, ensuring customers have the necessary information to make informed decisions.
                  </p>
                </div>
                <div>
                  <div className="w-20 h-20 rounded-full bg-brand-red mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Deliver Consistently</h3>
                  <p className="text-gray-600">
                    Enabled by international R&D expert collaboration, supply chain management, and quality control.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">How We Work</h2>
              <p className="text-xl text-brand-red font-semibold mb-8">
                Need-oriented. Professional support. Delivery-focused.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Need-Oriented</h3>
                  <p className="text-gray-600">
                    We listen first. Every solution begins with understanding your specific requirements.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Support</h3>
                  <p className="text-gray-600">
                    Our international R&D network provides technical expertise and application support.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Delivery-Focused</h3>
                  <p className="text-gray-600">
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
                  <p className="text-5xl font-bold text-brand-red">2019</p>
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
EOF

echo "Created Who We Are page (1/6)"

# Create Brands page
cat > app/brands/page.tsx << 'EOF'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function BrandsPage() {
  return (
    <>
      <Header />
      <section className="py-32 px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">Our Brands</h1>
          <p className="text-xl text-gray-600">
            Three specialized brands delivering comprehensive dairy ingredient solutions
          </p>
        </div>
      </section>

      {/* NEULINK Section */}
      <section className="py-16 px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-8 mb-8">
            <div className="w-32">
              <div className="bg-brand-red py-3 px-6 rounded text-center">
                <span className="text-lg font-bold text-white">NEULINK</span>
              </div>
            </div>
            <h2 className="text-5xl font-bold text-gray-900">Trusted Connections</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our proprietary ingredient brand built on the principle of reducing information asymmetry.
                NEULINK embodies our core philosophy: Linking Trust. Creating Value.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Through transparent connections and honest communication, we create efficient, value-added
                solutions tailored to our customers' specific needs.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Key Features:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-brand-red">✓</span>
                  <span className="text-gray-700">Custom solutions based on customer needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-red">✓</span>
                  <span className="text-gray-700">Transparent sourcing and specifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-red">✓</span>
                  <span className="text-gray-700">Application support from R&D network</span>
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
              <div className="bg-brand-green py-3 px-6 rounded text-center">
                <span className="text-lg font-bold text-white">FOONEXUS</span>
              </div>
            </div>
            <h2 className="text-5xl font-bold text-gray-900">Organic Excellence</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our specialized organic product line serving the growing demand for certified organic ingredients
                in infant nutrition and health products.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                FOONEXUS represents our commitment to sustainable, traceable organic ingredients. Every product
                maintains full certification and meets the strictest organic standards.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Portfolio:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span className="text-gray-700">Organic Lactose</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span className="text-gray-700">Organic D90</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span className="text-gray-700">Organic WPC</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span className="text-gray-700">Organic GOS</span>
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
              <div className="bg-brand-blue py-3 px-6 rounded text-center">
                <span className="text-lg font-bold text-white">LVEO</span>
              </div>
            </div>
            <h2 className="text-5xl font-bold text-gray-900">Protein Innovation</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Premium whey protein line with leading market influence in China's protein sector.
                LVEO delivers high-quality ingredients for performance and recovery nutrition.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our whey proteins are sourced from premium suppliers and processed to maintain optimal
                nutritional value and functional properties. LVEO serves sports nutrition, clinical nutrition, and specialized formula markets.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Portfolio:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                  <span className="text-gray-700">WPC80</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                  <span className="text-gray-700">WPI</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                  <span className="text-gray-700">Hydrolyzed WPC80</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Comparison */}
      <section className="bg-[#FAFAFA] py-16 px-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Brand Overview</h2>
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <span className="text-brand-red font-bold text-lg">NEULINK</span>
                </div>
                <div className="text-gray-900">Custom Solutions</div>
                <div className="text-gray-600">Tailored solutions, application support</div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <span className="text-brand-green font-bold text-lg">FOONEXUS</span>
                </div>
                <div className="text-gray-900">Organic Ingredients</div>
                <div className="text-gray-600">Organic Lactose, D90, WPC, GOS</div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <span className="text-brand-blue font-bold text-lg">LVEO</span>
                </div>
                <div className="text-gray-900">Whey Proteins</div>
                <div className="text-gray-600">WPC80, WPI, Hydrolyzed WPC80</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-red py-24 px-16 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl font-bold text-white mb-6">Find Your Solution</h2>
          <p className="text-xl text-white opacity-90 mb-10">
            Explore our product portfolio or contact us for customized solutions
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-brand-red px-12 py-5 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Products
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
EOF

echo "Created Brands page (2/6)"

# Create Products page
cat > app/products/page.tsx << 'EOF'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function ProductsPage() {
  return (
    <>
      <Header />
      <section className="py-32 px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">Products</h1>
          <p className="text-xl text-gray-600 mb-16">
            Comprehensive dairy ingredient portfolio across three specialized brands
          </p>

          {/* NEULINK Products */}
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-brand-red px-6 py-3 rounded">
                <span className="text-lg font-bold text-white">NEULINK</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Custom Solutions</h2>
            </div>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl">
              Tailored ingredient solutions designed to meet your specific requirements. From specification to application, we provide end-to-end support.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Carbohydrates</h3>
                <p className="text-gray-600 mb-4">Lactose, Maltodextrin, Glucose Syrup Solids</p>
                <p className="text-sm text-brand-red font-semibold">Custom specifications available</p>
              </div>
              <div className="bg-white border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Proteins</h3>
                <p className="text-gray-600 mb-4">WPC, WPI, Milk Protein Isolate, Caseinates</p>
                <p className="text-sm text-brand-red font-semibold">Wide range of protein levels</p>
              </div>
              <div className="bg-white border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Fats & Oils</h3>
                <p className="text-gray-600 mb-4">Milk fat, Anhydrous milk fat, Vegetable oil blends</p>
                <p className="text-sm text-brand-red font-semibold">Custom blends for formula applications</p>
              </div>
              <div className="bg-white border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Specialty Ingredients</h3>
                <p className="text-gray-600 mb-4">HMO, GOS, FOS, Vitamins, Minerals</p>
                <p className="text-sm text-brand-red font-semibold">Application support included</p>
              </div>
            </div>
          </section>

          {/* FOONEXUS Products */}
          <section className="mb-20 bg-[#F8F8F8] -mx-16 px-16 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand-green px-6 py-3 rounded">
                  <span className="text-lg font-bold text-white">FOONEXUS</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Organic Ingredients</h2>
              </div>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl">
                Certified organic ingredients for infant formula and health products. Full traceability from farm to finish.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Organic Lactose</h3>
                  <p className="text-gray-600 text-sm">EU & USDA certified</p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Organic D90</h3>
                  <p className="text-gray-600 text-sm">Spray-dried permeate</p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Organic WPC</h3>
                  <p className="text-gray-600 text-sm">Various protein levels</p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Organic GOS</h3>
                  <p className="text-gray-600 text-sm">Prebiotic fiber</p>
                </div>
              </div>
            </div>
          </section>

          {/* LVEO Products */}
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-brand-blue px-6 py-3 rounded">
                <span className="text-lg font-bold text-white">LVEO</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Whey Proteins</h2>
            </div>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl">
              Premium whey proteins for sports nutrition, clinical nutrition, and specialized formula applications.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">WPC80</h3>
                <p className="text-gray-600 mb-4">80% protein concentrate</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Instant and standard forms</li>
                  <li>• Various flavor options</li>
                  <li>• Excellent solubility</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">WPI</h3>
                <p className="text-gray-600 mb-4">90%+ protein isolate</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Ultra-pure protein</li>
                  <li>• Low fat and lactose</li>
                  <li>• Rapid absorption</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Hydrolyzed WPC80</h3>
                <p className="text-gray-600 mb-4">Partially hydrolyzed</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Easy digestion</li>
                  <li>• Reduced allergenicity</li>
                  <li>• Medical nutrition grade</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Applications */}
          <section>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Applications</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-brand-peach/30 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Infant Formula</h3>
                <p className="text-gray-600">
                  Complete ingredient solutions for infant formula and follow-on formula
                </p>
              </div>
              <div className="bg-brand-peach/30 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sports Nutrition</h3>
                <p className="text-gray-600">
                  Performance and recovery proteins for active lifestyle and athletic applications
                </p>
              </div>
              <div className="bg-brand-peach/30 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Medical Nutrition</h3>
                <p className="text-gray-600">
                  Clinical nutrition products for special dietary and medical requirements
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-dark py-24 px-16 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl font-bold text-white mb-6">Need More Information?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Contact our team to discuss your specific ingredient requirements
          </p>
          <Link
            href="/contact"
            className="inline-block bg-brand-red text-white px-12 py-5 rounded-lg text-lg font-semibold hover:bg-brand-redDark transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
EOF

echo "Created Products page (3/6)"

# Create Capabilities page
cat > app/capabilities/page.tsx << 'EOF'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function CapabilitiesPage() {
  return (
    <>
      <Header />
      <section className="py-32 px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">Capabilities</h1>
          <p className="text-xl text-gray-600 mb-20">
            End-to-end solutions powered by international expertise and robust quality systems
          </p>

          {/* R&D Expertise */}
          <section className="mb-24">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">R&D Expertise</h2>
                <p className="text-xl text-gray-600 mb-6">
                  International expert network providing technical support and application solutions
                </p>
              </div>
            </div>
            <div className="pl-22">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Application Support</h3>
                  <p className="text-gray-600">
                    Our R&D experts work directly with your team to develop customized solutions, optimize formulations, and troubleshoot technical challenges.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Formula Development</h3>
                  <p className="text-gray-600">
                    From concept to commercialization, we support the entire product development process with technical expertise and market insights.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Ingredient Innovation</h3>
                  <p className="text-gray-600">
                    Access to the latest ingredient innovations and emerging trends through our global research network.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Technical Training</h3>
                  <p className="text-gray-600">
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
                <span className="text-brand-red text-2xl font-bold">2</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Supply Chain Management</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Reliable logistics and inventory management ensuring consistent supply
                </p>
              </div>
            </div>
            <div className="pl-22">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Sourcing Excellence</h3>
                  <p className="text-gray-600">
                    Direct relationships with premium dairy producers globally, ensuring quality and supply security.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h3>
                  <p className="text-gray-600">
                    Strategic warehousing and just-in-time delivery to optimize your inventory costs while ensuring supply continuity.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Logistics Coordination</h3>
                  <p className="text-gray-600">
                    End-to-end logistics management from origin to destination, including customs clearance and regulatory compliance.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Supply Security</h3>
                  <p className="text-gray-600">
                    Multiple sourcing options and contingency planning to mitigate supply chain risks.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quality Control */}
          <section className="mb-24">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Quality Control</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Rigorous quality systems ensuring product safety and compliance
                </p>
              </div>
            </div>
            <div className="pl-22">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Certification Management</h3>
                  <p className="text-gray-600">
                    Full certification support including organic, kosher, halal, and food safety standards (ISO, HACCP, FSSC).
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Specification Compliance</h3>
                  <p className="text-gray-600">
                    Strict adherence to product specifications with comprehensive testing and documentation.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Traceability</h3>
                  <p className="text-gray-600">
                    Complete batch traceability from origin to delivery, ensuring transparency and accountability.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Regulatory Support</h3>
                  <p className="text-gray-600">
                    Expert guidance on regulatory requirements for China, Southeast Asia, and international markets.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Process Overview */}
          <section className="bg-[#F8F8F8] p-12 rounded-xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Process</h2>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-red mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Understand</h3>
                <p className="text-sm text-gray-600">Identify requirements</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-red mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Source</h3>
                <p className="text-sm text-gray-600">Select quality suppliers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-red mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Develop</h3>
                <p className="text-sm text-gray-600">Customize solutions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-red mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Deliver</h3>
                <p className="text-sm text-gray-600">Ensure timely logistics</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-red mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">5</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Support</h3>
                <p className="text-sm text-gray-600">Ongoing partnership</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  )
}
EOF

echo "Created Capabilities page (4/6)"

# Create Markets page
cat > app/markets/page.tsx << 'EOF'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function MarketsPage() {
  return (
    <>
      <Header />
      <section className="py-32 px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">Markets</h1>
          <p className="text-xl text-gray-600 mb-20">
            Serving the dynamic markets of China and Southeast Asia with premium dairy ingredients
          </p>

          {/* Geographic Focus */}
          <section className="mb-24">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Geographic Focus</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border-l-4 border-brand-red p-8 rounded-lg shadow-sm">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">China</h3>
                <p className="text-lg text-gray-600 mb-4">
                  The world's largest infant formula market with growing demand for premium ingredients
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Infant formula & specialized nutrition</li>
                  <li>• Sports nutrition market</li>
                  <li>• Clinical nutrition products</li>
                  <li>• Growing organic segment</li>
                </ul>
              </div>
              <div className="bg-white border-l-4 border-brand-green p-8 rounded-lg shadow-sm">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Southeast Asia</h3>
                <p className="text-lg text-gray-600 mb-4">
                  Emerging markets with rising middle class and increasing health awareness
                </p>
                <ul className="space-y-2 text-gray-600">
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
            <h2 className="text-4xl font-bold text-gray-900 mb-12">Industry Sectors</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#F8F8F8] p-8 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-brand-red mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Infant Formula</h3>
                <p className="text-gray-600 mb-4">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sports Nutrition</h3>
                <p className="text-gray-600 mb-4">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Medical Nutrition</h3>
                <p className="text-gray-600 mb-4">
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
                <h3 className="text-5xl font-bold text-brand-red mb-2">2020</h3>
                <p className="text-gray-300">China infant formula market size (USD billions)</p>
              </div>
              <div>
                <h3 className="text-5xl font-bold text-brand-peach mb-2">15%</h3>
                <p className="text-gray-300">Annual growth in premium segment</p>
              </div>
              <div>
                <h3 className="text-5xl font-bold text-brand-red mb-2">8%</h3>
                <p className="text-gray-300">CAGR SEA nutrition market</p>
              </div>
            </div>
          </section>

          {/* Our Presence */}
          <section className="mt-24">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Local Presence, Global Reach</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl">
              Headquartered in Switzerland with strong local presence across China and Southeast Asia.
              We combine Swiss quality standards with deep market understanding and local expertise.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Swiss HQ</h3>
                <p className="text-gray-600 text-sm">Quality oversight & strategic direction</p>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">China Operations</h3>
                <p className="text-gray-600 text-sm">Local sales, technical support & logistics</p>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">SEA Network</h3>
                <p className="text-gray-600 text-sm">Growing presence across key markets</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  )
}
EOF

echo "Created Markets page (5/6)"

# Create Contact page
cat > app/contact/page.tsx << 'EOF'
'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    country: '',
    brand: '',
    product: '',
    volume: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic would go here
    console.log('Form submitted:', formData)
    alert('Thank you for your message. We will get back to you shortly.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <Header />
      <section className="py-32 px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">Contact Us</h1>
          <p className="text-xl text-gray-600 mb-16">
            Get in touch with our team to discuss your ingredient requirements
          </p>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-900 mb-2">
                    Country/Region *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-semibold text-gray-900 mb-2">
                    Interested Brand
                  </label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  >
                    <option value="">Select a brand</option>
                    <option value="neulink">NEULINK</option>
                    <option value="foonexus">FOONEXUS</option>
                    <option value="lveo">LVEO</option>
                    <option value="multiple">Multiple/Not Sure</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="product" className="block text-sm font-semibold text-gray-900 mb-2">
                    Product/Requirement *
                  </label>
                  <input
                    type="text"
                    id="product"
                    name="product"
                    required
                    value={formData.product}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="volume" className="block text-sm font-semibold text-gray-900 mb-2">
                    Volume/Timeline (optional)
                  </label>
                  <input
                    type="text"
                    id="volume"
                    name="volume"
                    value={formData.volume}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    placeholder="e.g., 500 MT per year, starting Q2"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-red text-white py-4 rounded-lg text-lg font-semibold hover:bg-brand-redDark transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>

              <div className="bg-[#F8F8F8] p-8 rounded-lg mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Company Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company</p>
                    <p className="text-lg text-gray-900">Advance Ingredients AG</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Headquarters</p>
                    <p className="text-lg text-gray-900">Schaffhausen, Switzerland</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <a href="mailto:info@advance-ingredients.ch" className="text-lg text-brand-red hover:underline">
                      info@advance-ingredients.ch
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Our Brands</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-red"></div>
                    <div>
                      <p className="font-bold text-gray-900">NEULINK</p>
                      <p className="text-sm text-gray-600">Custom Solutions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-green"></div>
                    <div>
                      <p className="font-bold text-gray-900">FOONEXUS</p>
                      <p className="text-sm text-gray-600">Organic Ingredients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-blue"></div>
                    <div>
                      <p className="font-bold text-gray-900">LVEO</p>
                      <p className="text-sm text-gray-600">Whey Proteins</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-brand-peach/30 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Business Hours</h3>
                <p className="text-gray-600">
                  Monday - Friday: 9:00 AM - 6:00 PM (CET)<br />
                  Response time: Within 24 hours
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
EOF

echo "Created Contact page (6/6)"

echo ""
echo "✅ All 6 pages created successfully!"
echo ""
echo "Pages created:"
echo "  - /who-we-are"
echo "  - /brands"
echo "  - /products"
echo "  - /capabilities"
echo "  - /markets"
echo "  - /contact"
echo ""
echo "Next steps:"
echo "  1. cd '/home/lu/Desktop/Advance Ingredients AG/website'"
echo "  2. npm install"
echo "  3. npm run dev"
echo ""
