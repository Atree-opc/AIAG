'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requestHint, setRequestHint] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setError('')
    setRequestHint('')
    setLoading(true)
    let shouldResetLoading = true

    const controller = new AbortController()
    const slowTimer = window.setTimeout(() => {
      setRequestHint('Network looks slow. Still trying... / 网络较慢，仍在尝试登录...')
    }, 4000)
    const abortTimer = window.setTimeout(() => {
      controller.abort()
    }, 15000)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
        signal: controller.signal,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed / 登录失败')
        return
      }

      shouldResetLoading = false
      setRequestHint('Login successful. Redirecting... / 登录成功，正在跳转...')
      router.replace(data.redirect)
      router.refresh()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Login request timed out. Please retry. / 登录请求超时，请重试。')
      } else {
        setError('Network error. Please retry. / 网络错误，请重试。')
      }
    } finally {
      window.clearTimeout(slowTimer)
      window.clearTimeout(abortTimer)
      if (shouldResetLoading) {
        setRequestHint('')
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-4">
      <Link href="/" className="absolute top-6 left-6 text-text-muted hover:text-primary transition-colors flex items-center gap-1 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        Back / 返回主页
      </Link>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="AIAG Logo" width={120} height={48} className="object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary text-center mb-1">
          Portal Login
        </h1>
        <p className="text-text-secondary text-center text-sm mb-8">
          内部系统登录
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Username / 用户名
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Password / 密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {loading && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-800">
              <p>{requestHint || 'Submitting login request... / 正在提交登录请求...'}</p>
              <p className="mt-1 text-xs text-blue-700">
                Please wait and do not click repeatedly. / 请稍候，不要重复点击。
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in... / 登录中...' : 'Login / 登录'}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-8">
          Advance Ingredients AG &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
