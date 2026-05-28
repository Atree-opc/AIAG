import jwt, { SignOptions } from 'jsonwebtoken'
import { JWTPayload } from '@/types'

const SECRET = process.env.JWT_SECRET!

export function signToken(payload: JWTPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, SECRET, options)
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, SECRET) as JWTPayload
}

export function extractToken(req: Request): string | null {
  // 1. httpOnly cookie (preferred)
  const cookie = req.headers.get('cookie')
  if (cookie) {
    const match = cookie.match(/(?:^|;\s*)token=([^;]+)/)
    if (match) return decodeURIComponent(match[1])
  }
  // 2. Authorization: Bearer header (legacy support)
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}
