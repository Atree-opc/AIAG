import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-text-primary text-text-muted py-12">
      <div className="container mx-auto px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold text-white">
              ADVANCE INGREDIENTS AG
            </h3>
            <p className="text-xs text-gray-300">
              Linking Trust. Creating Value.
            </p>
            <p className="text-xs text-text-secondary">
              Schaffhausen, Switzerland · Est. 2019
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-white">Quick Links</h4>
            <Link href="/" className="text-xs hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/who-we-are" className="text-xs hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="/capabilities" className="text-xs hover:text-white transition-colors">
              Solutions
            </Link>
            <Link href="/brands" className="text-xs hover:text-white transition-colors">
              Brands & Products
            </Link>
          </div>

          {/* More Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-white">Explore</h4>
            <Link href="/markets" className="text-xs hover:text-white transition-colors">
              Markets
            </Link>
            <Link href="/contact" className="text-xs hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-white">Legal</h4>
            <Link href="/privacy" className="text-xs hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-secondary">
            © 2019-2025 Advance Ingredients AG. All rights reserved.
          </p>
          <a href="mailto:info@advance-ingredients.ch" className="text-xs hover:text-text-muted transition-colors">
            info@advance-ingredients.ch
          </a>
        </div>
      </div>
    </footer>
  )
}
