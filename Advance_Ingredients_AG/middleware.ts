import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/portal')) {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      const { payload } = await jwtVerify(token, secret)
      const role = payload.role as string
      // Prevent role from accessing another role's dashboard
      const segment = pathname.split('/')[2] // /portal/[role]/...
      if (segment && segment !== role) {
        return NextResponse.redirect(new URL(`/portal/${role}/orders`, req.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
