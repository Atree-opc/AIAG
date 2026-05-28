import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import pool from '@/lib/db'
import { signToken } from '@/lib/auth'
import { Role, ROLE_REDIRECT } from '@/types'
import { ensureAccountantDir } from '@/lib/file-storage'

// Simple in-memory rate limiter: max 10 failures per IP per 15 minutes
// 简单内存限速：每个 IP 15 分钟内最多失败 10 次
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 20
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
}

function checkRateLimit(ip: string): { blocked: boolean; remaining: number } {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 0, resetAt: now + WINDOW_MS })
    return { blocked: false, remaining: MAX_ATTEMPTS }
  }
  return { blocked: entry.count >= MAX_ATTEMPTS, remaining: MAX_ATTEMPTS - entry.count }
}

function recordFailure(ip: string) {
  const entry = loginAttempts.get(ip)!
  entry.count += 1
}

function resetAttempts(ip: string) {
  loginAttempts.delete(ip)
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const { blocked, remaining } = checkRateLimit(ip)

  if (blocked) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Please try again in 15 minutes. / 登录失败次数过多，请15分钟后再试。' },
      { status: 429 }
    )
  }

  try {
    const { name, password } = await req.json()

    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password required' }, { status: 400 })
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE name = $1',
      [name]
    )
    const user = rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      recordFailure(ip)
      // 故意不区分"用户不存在"和"密码错误"，防止用户名枚举
      return NextResponse.json(
        { error: '账户或密码错误 / Invalid password or account' },
        { status: 401 }
      )
    }

    resetAttempts(ip)

    // Ensure current and next month accountant folders exist
    try {
      const now = new Date()
      const curYear = now.getFullYear(), curMonth = now.getMonth() + 1
      const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      ensureAccountantDir(curYear, curMonth)
      ensureAccountantDir(nextDate.getFullYear(), nextDate.getMonth() + 1)
    } catch { /* non-fatal */ }

    const token = signToken({ userId: user.user_id, role: user.role, name: user.name })

    // Token is in httpOnly cookie only — not returned in body
    const res = NextResponse.json({
      user: { id: user.user_id, name: user.name, role: user.role },
      redirect: ROLE_REDIRECT[user.role as Role],
    })

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
