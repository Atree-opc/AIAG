'use client'

import { useEffect, useState } from 'react'
import { User, Role } from '@/types'

function authHeaders() {
  return { 'Content-Type': 'application/json' }
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin / 管理员',
  staff: 'Staff / 员工',
  supplier: 'Supplier / 供应商',
  customer: 'Customer / 客户',
  accountant: 'Accountant / 财务',
}

const EMPTY_FORM = { name: '', role: 'customer' as Role, password: '', company_name: '', address: '', city: '', country: '' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [error, setError] = useState('')

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/users', { headers: authHeaders() })
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  function openCreate() {
    setEditUser(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
    setError('')
  }

  async function openEdit(user: User) {
    setError('')
    const res = await fetch(`/api/users/${user.user_id}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Error')
      return
    }
    setEditUser(data)
    setForm({
      name: data.name, role: data.role, password: '',
      company_name: data.company_name ?? '',
      address: data.address ?? '',
      city: data.city ?? '',
      country: data.country ?? '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const body: any = {
      name: form.name, role: form.role,
      company_name: form.company_name || null,
      address: form.address || null,
      city: form.city || null,
      country: form.country || null,
    }
    if (form.password) body.password = form.password

    const url = editUser ? `/api/users/${editUser.user_id}` : '/api/users'
    const method = editUser ? 'PATCH' : 'POST'

    if (!editUser && !form.password) {
      setError('Password is required / 密码必填')
      return
    }

    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error'); return }
    setShowForm(false)
    fetchUsers()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? / 确认删除用户 "${name}"？`)) return
    await fetch(`/api/users/${id}`, { method: 'DELETE', headers: authHeaders() })
    fetchUsers()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Users / 用户管理</h1>
          <p className="text-sm text-text-secondary mt-0.5">{users.length} users total</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New User / 新建用户
        </button>
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Loading... / 加载中...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-text-secondary text-xs">
                <th className="text-left px-4 py-3 font-medium">Username / 用户名</th>
                <th className="text-left px-4 py-3 font-medium">Role / 角色</th>
                <th className="text-left px-4 py-3 font-medium">Created / 创建时间</th>
                <th className="text-left px-4 py-3 font-medium">Actions / 操作</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-text-muted">No users / 暂无用户</td></tr>
              )}
              {users.map(user => (
                <tr key={user.user_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-text-secondary capitalize">
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(user)} className="text-xs text-blue-600 hover:underline">Edit / 编辑</button>
                      <button onClick={() => handleDelete(user.user_id, user.name)} className="text-xs text-red-500 hover:underline">Delete / 删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8">
            <h2 className="text-lg font-bold mb-6">
              {editUser ? 'Edit User / 编辑用户' : 'New User / 新建用户'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Username / 用户名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Role / 角色</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {editUser ? 'New Password / 新密码 (leave blank to keep)' : 'Password / 密码'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required={!editUser}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wide">Profile / 资料</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Company Name / 公司名称</label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Address / 地址</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-text-secondary mb-1">City / 城市</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-text-secondary mb-1">Country / 国家</label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-text-secondary border border-gray-200 rounded-lg">
                  Cancel / 取消
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg font-medium">
                  {editUser ? 'Save / 保存' : 'Create / 创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
