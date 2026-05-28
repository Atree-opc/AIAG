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
          <h1 className="text-6xl font-bold text-text-primary mb-8">Contact Us</h1>
          <p className="text-xl text-text-secondary mb-16">
            Get in touch with our team to discuss your ingredient requirements
          </p>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-8">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
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
                  <label htmlFor="company" className="block text-sm font-semibold text-text-primary mb-2">
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
                  <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
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
                  <label htmlFor="country" className="block text-sm font-semibold text-text-primary mb-2">
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
                  <label htmlFor="brand" className="block text-sm font-semibold text-text-primary mb-2">
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
                  <label htmlFor="product" className="block text-sm font-semibold text-text-primary mb-2">
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
                  <label htmlFor="volume" className="block text-sm font-semibold text-text-primary mb-2">
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
                  <label htmlFor="message" className="block text-sm font-semibold text-text-primary mb-2">
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
                  className="w-full bg-primary text-white py-4 rounded-lg text-lg font-semibold hover:bg-primaryDark transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-8">Contact Information</h2>

              <div className="bg-[#F8F8F8] p-8 rounded-lg mb-8">
                <h3 className="text-xl font-bold text-text-primary mb-6">Company Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company</p>
                    <p className="text-lg text-text-primary">Advance Ingredients AG</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Headquarters</p>
                    <p className="text-lg text-text-primary">Schaffhausen, Switzerland</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <a href="mailto:info@advance-ingredients.ch" className="text-lg text-primary hover:underline">
                      info@advance-ingredients.ch
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-text-primary">Our Brands</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img src="/NEULINK-logo.png" alt="NEULINK" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="font-bold text-text-primary">NEULINK</p>
                      <p className="text-sm text-text-secondary">Custom Solutions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <img src="/FOONEXUS-logo.png" alt="FOONEXUS" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="font-bold text-text-primary">FOONEXUS</p>
                      <p className="text-sm text-text-secondary">Organic Ingredients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <img src="/LVEO-logo.jpg" alt="LVEO" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="font-bold text-text-primary">LVEO</p>
                      <p className="text-sm text-text-secondary">Whey Proteins</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-brand-peach/30 rounded-lg">
                <h3 className="font-bold text-text-primary mb-2">Business Hours</h3>
                <p className="text-text-secondary">
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
