import { NextResponse } from 'next/server'
import { verifyToken, extractToken } from './auth'
import { JWTPayload, Role } from '@/types'

export function withAuth(
  handler: (req: Request, user: JWTPayload, context?: any) => Promise<Response>,
  allowedRoles?: Role[]
) {
  return async (req: Request, context?: any): Promise<Response> => {
    const token = extractToken(req)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user: JWTPayload
    try {
      user = verifyToken(token)
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return handler(req, user, context)
  }
}
