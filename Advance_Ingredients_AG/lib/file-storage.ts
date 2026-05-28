import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// Store files outside project directory on local dev
export const UPLOAD_ROOT = process.env.UPLOAD_ROOT ?? '/home/lu/uploads/orders'

/**
 * Orders are organized by year/month on disk:
 *   {UPLOAD_ROOT}/{year}/{MM}/{containerNumber}/
 * Orders without an assigned period go to:
 *   {UPLOAD_ROOT}/unassigned/{containerNumber}/
 */
export function getOrderDir(year: number | null, month: number | null, containerNumber: string): string {
  if (year && month) {
    return path.join(UPLOAD_ROOT, String(year), String(month).padStart(2, '0'), containerNumber)
  }
  return path.join(UPLOAD_ROOT, 'unassigned', containerNumber)
}

export function ensureOrderDir(year: number | null, month: number | null, containerNumber: string): string {
  const dir = getOrderDir(year, month, containerNumber)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export function generateStoredName(originalName: string): string {
  const ext = path.extname(originalName)
  return `${randomUUID()}${ext}`
}

export function getFilePath(year: number | null, month: number | null, containerNumber: string, storedName: string): string {
  const filePath = path.resolve(getOrderDir(year, month, containerNumber), storedName)
  // Guard against path traversal: final path must stay within UPLOAD_ROOT
  if (!filePath.startsWith(path.resolve(UPLOAD_ROOT) + path.sep)) {
    throw new Error('Path traversal detected')
  }
  return filePath
}

export function deleteFile(year: number | null, month: number | null, containerNumber: string, storedName: string): void {
  const filePath = getFilePath(year, month, containerNumber, storedName)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

// ── Accountant file storage (physically isolated) ──────────────────────────
export const ACCOUNTANT_ROOT = process.env.ACCOUNTANT_ROOT ?? '/home/lu/uploads/accountant'

export function getAccountantDir(year: number, month: number): string {
  return path.join(ACCOUNTANT_ROOT, String(year), String(month).padStart(2, '0'))
}

export function ensureAccountantDir(year: number, month: number): string {
  const dir = getAccountantDir(year, month)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export function getAccountantFilePath(year: number, month: number, storedName: string): string {
  const filePath = path.resolve(getAccountantDir(year, month), storedName)
  if (!filePath.startsWith(path.resolve(ACCOUNTANT_ROOT) + path.sep)) {
    throw new Error('Path traversal detected')
  }
  return filePath
}

export function deleteAccountantFile(year: number, month: number, storedName: string): void {
  const filePath = getAccountantFilePath(year, month, storedName)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

// ── Shared ──────────────────────────────────────────────────────────────────
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
])

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
