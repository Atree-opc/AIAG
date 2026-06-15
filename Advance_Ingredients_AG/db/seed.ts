import bcrypt from 'bcrypt'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const pool = new Pool({
  host:     process.env.DB_HOST     ?? '127.0.0.1',
  port:     Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME     ?? 'advance_ingredients',
  user:     process.env.DB_USER     ?? 'postgres',
  password: process.env.DB_PASSWORD,
})

const users = [
  { name: 'admin',       role: 'admin',    password: 'admin123' },
  { name: 'staff',       role: 'staff',    password: 'staff123' },
  // Suppliers
  { name: 'Fonterra',    role: 'supplier', password: 'supplier123' },
  { name: 'Arla',        role: 'supplier', password: 'supplier123' },
  { name: 'Lactalis',    role: 'supplier', password: 'supplier123' },
  // Customers
  { name: 'ChinaDairy',  role: 'customer', password: 'customer123' },
  { name: 'ShanghaiFood',role: 'customer', password: 'customer123' },
  { name: 'BeijingTrade',role: 'customer', password: 'customer123' },
  { name: 'GuangzhouImp',role: 'customer', password: 'customer123' },
  { name: 'ShenzhenCo',  role: 'customer', password: 'customer123' },
]

async function seed() {
  console.log('Seeding users...')
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 12)
    await pool.query(
      `INSERT INTO users (name, role, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [user.name, user.role, hash]
    )
    console.log(`✓ ${user.role}: ${user.name} / ${user.password}`)
  }
  await pool.end()
  console.log('Done.')
}

seed().catch(err => { console.error(err); process.exit(1) })
