import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PortalChrome from '@/components/PortalChrome'
import { verifyToken } from '@/lib/auth'
import { Role } from '@/types'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('token')?.value

  if (!token) {
    redirect('/login')
  }

  try {
    const user = verifyToken(token)

    return (
      <PortalChrome role={user.role as Role} userName={user.name}>
        {children}
      </PortalChrome>
    )
  } catch {
    redirect('/login')
  }
}
