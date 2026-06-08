'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Role } from '@/types'

interface NavItem {
  label: string
  labelZh: string
  href: string
}

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { label: 'Orders', labelZh: '订单管理', href: '/portal/admin/orders' },
    { label: 'Users', labelZh: '用户管理', href: '/portal/admin/users' },
    { label: 'Settings', labelZh: '设置', href: '/portal/admin/settings' },
  ],
  staff: [
    { label: 'Orders Overview', labelZh: '订单总览', href: '/portal/staff/orders-overview' },
    { label: 'Orders', labelZh: '订单管理', href: '/portal/staff/orders' },
    { label: 'Finance', labelZh: '财务文件', href: '/portal/staff/finance' },
    { label: 'Settings', labelZh: '设置', href: '/portal/staff/settings' },
  ],
  supplier: [
    { label: 'Orders', labelZh: '我的订单', href: '/portal/supplier/orders' },
  ],
  customer: [
    { label: 'Orders', labelZh: '我的订单', href: '/portal/customer/orders' },
  ],
  accountant: [
    { label: 'Orders', labelZh: '订单查看', href: '/portal/accountant/orders' },
    { label: 'Finance', labelZh: '财务文件', href: '/portal/accountant/finance' },
  ],
}

interface PortalChromeProps {
  role: Role
  userName: string
  children: React.ReactNode
}

export default function PortalChrome({ role, userName, children }: PortalChromeProps) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const navItems = NAV[role]

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6 justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Image src="/logo_home.png" alt="AIAG" width={250} height={25} className="object-contain" />
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                {item.label} <span className="text-xs opacity-70">/ {item.labelZh}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">
            {userName} &middot; <span className="capitalize">{role}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-text-muted hover:text-primary transition-colors"
          >
            Logout / 退出
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-screen-xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
