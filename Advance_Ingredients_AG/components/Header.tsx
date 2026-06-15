'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/who-we-are' },
  { name: 'Solutions', href: '/capabilities' },
  { name: 'Brands & Products', href: '/brands' },
  { name: 'Markets', href: '/markets' },
  { name: 'Contact Us', href: '/contact' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  return (
    <header className="relative z-50 border-b border-gray-100 bg-bg h-24 shadow-sm sticky top-0">
      <div className="w-full px-6 md:px-12 h-full flex items-center justify-between">
        {/* Logo — top left */}
        <Link href="/" className="flex items-center h-full shrink-0">
          <Image
            src="/logo_home.png"
            alt="Advance Ingredients AG Logo"
            width={240}
            height={66}
            priority
            className="h-full max-h-[66px] w-auto object-contain max-w-[90px] sm:max-w-[120px] md:max-w-none"
          />
        </Link>

        {/* Desktop: nav + CTA grouped on the right */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-7">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm transition-colors hover:text-primary whitespace-nowrap",
                    isActive ? "text-primary font-medium" : "text-text-primary"
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <Link
            href="/login"
            className="bg-primary text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-primary-hover transition-all shadow-md hover:shadow-lg whitespace-nowrap"
          >
            Orders
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden" ref={menuRef}>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
              mobileMenuOpen ? "bg-gray-100" : "hover:bg-gray-100"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              // Close icon (X)
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger menu icon (three horizontal lines)
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Dropdown Menu Panel */}
          <div
            className={cn(
              "absolute top-full right-4 w-64 bg-white border border-gray-200 shadow-xl rounded-b-lg mt-1",
              "transition-all duration-200 ease-in-out origin-top",
              mobileMenuOpen
                ? "opacity-100 scale-y-100 visible"
                : "opacity-0 scale-y-95 invisible"
            )}
          >
            <div className="py-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-4 py-3 text-base transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-text-primary hover:bg-gray-100 hover:text-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-semibold text-primary hover:bg-gray-100 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
