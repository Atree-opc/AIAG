const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const users = [
  { name: 'admin', role: 'admin', password: 'admin123' },
  { name: 'staff', role: 'staff', password: 'staff123' },
  { name: 'Fonterra', role: 'supplier', password: 'supplier123' },
  { name: 'Arla', role: 'supplier', password: 'supplier123' },
  { name: 'Lactalis', role: 'supplier', password: 'supplier123' },
  { name: 'ChinaDairy', role: 'customer', password: 'customer123' },
  { name: 'ShanghaiFood', role: 'customer', password: 'customer123' },
  { name: 'BeijingTrade', role: 'customer', password: 'customer123' },
  { name: 'GuangzhouImp', role: 'customer', password: 'customer123' },
  { name: 'ShenzhenCo', role: 'customer', password: 'customer123' }
];

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

(async () => {
  console.log('Seeding users...');
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 12);
    await pool.query(
      'INSERT INTO users (name, role, password_hash) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET password_hash = EXCLUDED.password_hash',
      [user.name, user.role, hash]
    );
    console.log('OK ' + user.role + ': ' + user.name);
  }
  await pool.end();
  console.log('Done.');
})().catch(async (err) => {
  console.error(err);
  try { await pool.end(); } catch {}
  process.exit(1);
});
