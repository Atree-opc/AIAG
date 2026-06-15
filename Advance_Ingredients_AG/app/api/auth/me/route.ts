import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'

export const GET = withAuth(async (_req, user: JWTPayload) => {
  return NextResponse.json({ userId: user.userId, role: user.role, name: user.name })
})
