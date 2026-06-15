const jwt = require('jsonwebtoken');
const { Client } = require('pg');
const secret = '6f83d57419676ea4bb702a26f44dd4a1b3668db7a51859d06445968b5d7a8c7a';
const token = jwt.sign({ userId: '00000000-0000-0000-0000-000000000999', role: 'admin', name: 'admin' }, secret, { expiresIn: '5m' });
const cn = 'NAMEIMPORT-' + Date.now();
(async () => {
  const res = await fetch('http://localhost:3050/api/orders/bulk-import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'token=' + token,
    },
    body: JSON.stringify({
      orders: [{ container_number: cn, customer_id: 'nongdu', supplier_id: 'dairyfood', brand: 'Test', product: 'Name Match', status: 'pending' }],
      defaultBelongedMonth: '2026-05',
      defaultBelongedQuarter: '2026-Q2'
    })
  });
  console.log('IMPORT_STATUS=' + res.status);
  console.log('IMPORT_BODY=' + await res.text());

  const c = new Client({ host: '127.0.0.1', port: 5432, user: 'project_user', password: 'Rand0mStr@ng', database: 'project_db' });
  await c.connect();
  const r = await c.query('SELECT container_number, customer_id, supplier_id, belonged_month FROM orders WHERE container_number = $1', [cn]);
  console.log('DB_ROW=' + JSON.stringify(r.rows[0] || null));
  await c.end();
})().catch(err => { console.error(err); process.exit(1); });
