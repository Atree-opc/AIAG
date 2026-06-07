import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import fs from 'fs'
import pool from '@/lib/db'
import { signToken } from '@/lib/auth'
import { Role, ROLE_REDIRECT } from '@/types'
import { ensureAccountantDir } from '@/lib/file-storage'

// Simple in-memory rate limiter: max 10 failures per IP per 15 minutes
// 简单内存限速：每个 IP 15 分钟内最多失败 10 次
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 20
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// #region debug-point shared:login-500-error
async function reportDebugEvent(runId: 'pre', hypothesisId: 'A' | 'B' | 'C' | 'D', location: string, msg: string, data: Record<string, unknown>) {
  let debugServerUrl = 'http://127.0.0.1:7777/event'
  let sessionId = 'login-500-error'
  try {
    const envText = fs.readFileSync(`${process.cwd()}/.dbg/login-500-error.env`, 'utf8')
    debugServerUrl = envText.match(/DEBUG_SERVER_URL=(.+)/)?.[1]?.trim() || debugServerUrl
    sessionId = envText.match(/DEBUG_SESSION_ID=(.+)/)?.[1]?.trim() || sessionId
  } catch {}
  await fetch(debugServerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, runId, hypothesisId, location, msg: `[DEBUG] ${msg}`, data, ts: Date.now() }),
  }).catch(() => {})
}
// #endregion

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
    // #region debug-point A:request-parsed
    await reportDebugEvent('pre', 'A', 'app/api/auth/login/route.ts:68', 'login request parsed', {
      ip,
      hasName: Boolean(name),
      hasPassword: Boolean(password),
      remaining,
    })
    // #endregion

    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password required' }, { status: 400 })
    }

    // #region debug-point A:before-db-query
    await reportDebugEvent('pre', 'A', 'app/api/auth/login/route.ts:79', 'querying user by name', {
      ip,
      name,
    })
    // #endregion
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE name = $1',
      [name]
    )
    const user = rows[0]
    // #region debug-point A:after-db-query
    await reportDebugEvent('pre', 'A', 'app/api/auth/login/route.ts:87', 'user query finished', {
      ip,
      name,
      foundUser: Boolean(user),
      role: user?.role ?? null,
      hasPasswordHash: Boolean(user?.password_hash),
    })
    // #endregion

    // #region debug-point B:before-bcrypt
    await reportDebugEvent('pre', 'B', 'app/api/auth/login/route.ts:96', 'about to verify password', {
      ip,
      name,
      foundUser: Boolean(user),
    })
    // #endregion
    const passwordMatched = user ? await bcrypt.compare(password, user.password_hash) : false
    // #region debug-point B:after-bcrypt
    await reportDebugEvent('pre', 'B', 'app/api/auth/login/route.ts:103', 'password verification finished', {
      ip,
      name,
      foundUser: Boolean(user),
      passwordMatched,
    })
    // #endregion

    if (!user || !passwordMatched) {
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

    // #region debug-point C:before-sign-token
    await reportDebugEvent('pre', 'C', 'app/api/auth/login/route.ts:126', 'about to sign jwt', {
      ip,
      userId: user.user_id,
      role: user.role,
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
    })
    // #endregion
    const token = signToken({ userId: user.user_id, role: user.role, name: user.name })
    // #region debug-point C:after-sign-token
    await reportDebugEvent('pre', 'C', 'app/api/auth/login/route.ts:134', 'jwt signed', {
      ip,
      userId: user.user_id,
      role: user.role,
      tokenLength: token.length,
    })
    // #endregion

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

    // #region debug-point D:response-ready
    await reportDebugEvent('pre', 'D', 'app/api/auth/login/route.ts:151', 'login response prepared', {
      ip,
      userId: user.user_id,
      role: user.role,
      redirect: ROLE_REDIRECT[user.role as Role],
    })
    // #endregion
    return res
  } catch (err) {
    // #region debug-point D:catch
    await reportDebugEvent('pre', 'D', 'app/api/auth/login/route.ts:160', 'login route threw', {
      ip,
      errorName: err instanceof Error ? err.name : typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack ?? null : null,
    })
    // #endregion
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
