import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Header />

      {/* Hero Section - Establish Authority and Trust */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/heropage.png')" }}
      >
        {/* 深色遮罩，提高文字可读性 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>

        <div className="relative z-10 container mx-auto max-w-6xl px-6 py-32 text-white">
          {/* 瑞士标签 */}
          <div className="mb-8 inline-flex items-center gap-3">
            <div className="h-px w-12 bg-white/60"></div>
            <div className="flex items-center gap-3">
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-sm font-semibold tracking-wider uppercase">
                Switzerland
              </span>
              <span className="text-white/80 font-medium">Est. 2019</span>
            </div>
            <div className="h-px w-12 bg-white/60"></div>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Linking Trust.<br />
            Creating Value.
          </h1>

          {/* Subtitle - Emphasizing Switzerland and Quality Control */}
          <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-3xl leading-relaxed font-light text-justify">
            Swiss Quality · Rigorous Quality Control · Dairy Ingredient Expert
          </p>

          <p className="text-lg text-white/75 mb-12 max-w-2xl leading-relaxed text-justify">
            Providing international R&D-supported dairy ingredient solutions for infant formula, medical nutrition, and sports nutrition
          </p>

          {/* 双按钮 CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-bg-primary text-text-primary px-10 py-5 rounded-lg text-base font-semibold hover:bg-bg-secondary transition-all transform hover:scale-105 shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-10 py-5 rounded-lg text-base font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              View Brands
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Who We Are - 简洁介绍 */}
      <section className="py-24 px-6 bg-bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-block text-primary text-sm font-bold tracking-widest uppercase mb-4">
            Who We Are
          </span>
          <h2 className="text-4xl font-bold text-text-primary mb-6">
            Swiss Company · Established in 2019
          </h2>
          <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto text-justify">
            Advance Ingredients AG is headquartered in Schaffhausen, Switzerland, specializing in dairy ingredient solutions for infant formula, medical nutrition, and sports nutrition industries, serving markets across China and Southeast Asia.
          </p>
        </div>
      </section>

      {/* 第二阶段：Solutions & Capabilities - 证明"我们懂行"与"我们有能力" */}
      <section className="py-24 px-6 bg-gradient-to-b from-bg-secondary to-bg-primary">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-bold tracking-widest uppercase mb-4">
              How We Work
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              How We Create Value for You
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Beyond simply selling products, we provide end-to-end technical services from requirements to delivery
            </p>
          </div>

          {/* 流程时间轴 */}
          <div className="relative">
            {/* 连接线 */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary via-brand-peach to-primary"></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* 步骤1 */}
              <div className="relative text-center group">
                <div className="relative z-10 mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Needs Clarification</h3>
                <p className="text-sm text-text-secondary">Deep understanding of your technical requirements and market positioning</p>
              </div>

              {/* 步骤2 */}
              <div className="relative text-center group">
                <div className="relative z-10 mx-auto w-20 h-20 bg-brand-peach rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Solution Design</h3>
                <p className="text-sm text-text-secondary">Customized technical solutions designed with R&D experts</p>
              </div>

              {/* 步骤3 */}
              <div className="relative text-center group">
                <div className="relative z-10 mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Sample Validation</h3>
                <p className="text-sm text-text-secondary">Providing samples for rigorous testing and validation</p>
              </div>

              {/* 步骤4 */}
              <div className="relative text-center group">
                <div className="relative z-10 mx-auto w-20 h-20 bg-brand-peach rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Supply Chain Planning</h3>
                <p className="text-sm text-text-secondary">Global resource coordination and delivery planning management</p>
              </div>

              {/* 步骤5 */}
              <div className="relative text-center group">
                <div className="relative z-10 mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Continuous Improvement</h3>
                <p className="text-sm text-text-secondary">Quality tracking and continuous improvement service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 第三阶段：Brands & Products - 品牌矩阵 */}
      <section className="py-24 px-6 bg-bg-primary">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-bold tracking-widest uppercase mb-4">
              Our Brands
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Three Brands · Comprehensive Solutions
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              From organic ingredients to premium proteins, we have everything you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FOONEXUS - 有机专家 */}
            <Link
              href="/brands"
              className="group relative bg-gradient-to-br from-green-50 to-white rounded-2xl p-10 border-2 border-green-100 hover:border-green-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="absolute top-6 right-6 w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-md">
                <img src="/FOONEXUS-logo.png" alt="FOONEXUS" className="w-full h-full object-contain" />
              </div>

              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold uppercase tracking-wider">
                  Organic
                </span>
              </div>

              <h3 className="text-3xl font-bold text-text-primary mb-4">FOONEXUS</h3>
              <p className="text-green-700 font-semibold mb-6">Organic Ingredients Expert</p>

              <p className="text-text-secondary leading-relaxed mb-4 text-justify">
                Specialized in certified organic dairy ingredients, serving infant nutrition and health food markets
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Organic Lactose</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Organic D90</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Organic WPC & GOS</span>
                </div>
              </div>
            </Link>

            {/* LVEO - 蛋白专家 */}
            <Link
              href="/brands"
              className="group relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-10 border-2 border-blue-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="absolute top-6 right-6 w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-md">
                <img src="/LVEO-logo.jpg" alt="LVEO" className="w-full h-full object-contain" />
              </div>

              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold uppercase tracking-wider">
                  Protein
                </span>
              </div>

              <h3 className="text-3xl font-bold text-text-primary mb-4">LVEO</h3>
              <p className="text-blue-700 font-semibold mb-6">Protein Innovation Expert</p>

              <p className="text-text-secondary leading-relaxed mb-4 text-justify">
                Premium whey protein products with leading influence in China's protein market
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>WPC80</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>WPI</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Hydrolyzed WPC80</span>
                </div>
              </div>
            </Link>

            {/* NEULINK - 定制方案 */}
            <Link
              href="/brands"
              className="group relative bg-gradient-to-br from-red-50 to-bg-primary rounded-2xl p-10 border-2 border-red-100 hover:border-primary hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="absolute top-6 right-6 w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-md">
                <img src="/NEULINK-logo.png" alt="NEULINK" className="w-full h-full object-contain" />
              </div>

              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-red-100 text-primary rounded-full text-sm font-bold uppercase tracking-wider">
                  Custom
                </span>
              </div>

              <h3 className="text-3xl font-bold text-text-primary mb-4">NEULINK</h3>
              <p className="text-primary font-semibold mb-6">Custom Solutions</p>

              <p className="text-text-secondary leading-relaxed mb-4 text-justify">
                Creating efficient value-added solutions through trust based on transparency principles
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>In-depth Needs Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Custom Formulation Services</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Full Technical Support</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 第四阶段：Values & Integrity - 消除顾虑，建立信任壁垒 */}
      <section className="py-24 px-6 bg-gradient-to-b from-bg-secondary to-bg-primary">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-bold tracking-widest uppercase mb-4">
              Our Values
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Integrity & Transparency · Building Trust
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Trust is not a slogan, but the result of consistent delivery. We are sincere with our customers, meaning clear communication, keeping promises, and proactively revealing risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Speak the truth */}
            <div className="relative bg-bg-primary rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-shadow group">
              <div className="absolute -top-6 left-10 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div className="pt-8">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Honest Communication</h3>
                <p className="text-text-secondary leading-relaxed mb-4 text-justify">
                  No exaggeration or hiding. We provide clear, verifiable information, including origin, specifications, delivery cycles, and product limitations.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Complete Documentation</span>
                </div>
              </div>
            </div>

            {/* Share what matters */}
            <div className="relative bg-white rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-shadow group">
              <div className="absolute -top-6 left-10 w-16 h-16 bg-brand-peach rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>

              <div className="pt-8">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Transparent Collaboration</h3>
                <p className="text-text-secondary leading-relaxed mb-4 text-justify">
                  Proactively reducing information asymmetry to enable informed decision-making, lower transaction costs, and improve collaboration efficiency.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time Data Sharing</span>
                </div>
              </div>
            </div>

            {/* Deliver consistently */}
            <div className="relative bg-bg-primary rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-shadow group">
              <div className="absolute -top-6 left-10 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v2a1 1 0 001 1h1.5a1 1 0 01.96.73L9 12l4.38-9.11A1 1 0 0114.31 2h3.38a1 1 0 01.93 1.34L16 11H8a1 1 0 00-1 1v4a1 1 0 001 1h1" />
                </svg>
              </div>

              <div className="pt-8">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Consistent Delivery</h3>
                <p className="text-text-secondary leading-relaxed mb-4 text-justify">
                  Backed by international R&D expert collaboration, supply chain management, and quality control, we pursue stable delivery and consistent quality.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>On-time Delivery Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 第五阶段：Contact - 促成行动 */}
      <section className="py-24 px-6 bg-bg-primary">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-bold tracking-widest uppercase mb-4">
              Get Started
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Start Collaboration
            </h2>
            <p className="text-xl text-text-secondary">
              Tell us your requirements, our expert team will contact you within 24 hours
            </p>
          </div>

          <div className="bg-gradient-to-br from-bg-secondary to-bg-primary rounded-2xl p-10 shadow-xl border border-gray-100">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 姓名 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
                    Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Your Name"
                  />
                </div>

                {/* 公司名称 */}
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-text-primary mb-2">
                    Company <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Your Company"
                  />
                </div>
              </div>

              {/* 邮箱 */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {/* 感兴趣的品牌 */}
              <div>
                <label htmlFor="brand" className="block text-sm font-semibold text-text-primary mb-2">
                  Interested Brand
                </label>
                <select
                  id="brand"
                  name="brand"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-bg-primary"
                >
                  <option value="">Please select...</option>
                  <option value="neulink">NEULINK - Custom Solutions</option>
                  <option value="foonexus">FOONEXUS - Organic Ingredients</option>
                  <option value="lveo">LVEO - Protein Products</option>
                  <option value="all">All Brands</option>
                </select>
              </div>

              {/* 留言 */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-text-primary mb-2">
                  Requirements Description
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Please briefly describe your requirements..."
                />
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-hover transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Submit Inquiry
              </button>

              {/* 隐私提示 */}
              <p className="text-xs text-text-muted text-center">
                <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                We respect your privacy. All information will be kept strictly confidential and used only for business communication. Compliant with GDPR data protection regulations.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
