import { Pool } from 'pg'

declare global {
  var _pgPool: Pool | undefined
}

const pool = globalThis._pgPool ?? new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max:      10,
  idleTimeoutMillis: 30000,
})

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool
}

export default pool
