async function main() {
  const loginResp = await fetch('http://localhost:3050/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'admin', password: 'admin123' })
  });
  console.log('LOGIN_STATUS=' + loginResp.status);
  const setCookie = loginResp.headers.get('set-cookie') || '';
  if (!loginResp.ok || !setCookie) throw new Error('login failed');

  const cn = 'AUTOIMPORT-' + new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const importResp = await fetch('http://localhost:3050/api/orders/bulk-import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': setCookie.split(';')[0],
    },
    body: JSON.stringify({
      orders: [{ container_number: cn, brand: 'Test', product: 'Excel Import', status: 'pending' }],
      defaultBelongedMonth: '2025-09',
      defaultBelongedQuarter: '2025-Q3',
    })
  });
  console.log('IMPORT_STATUS=' + importResp.status);
  console.log('IMPORT_BODY=' + await importResp.text());

  const { Client } = require('pg');
  const c = new Client({ host: '127.0.0.1', port: 5432, user: 'project_user', password: 'Rand0mStr@ng', database: 'project_db' });
  await c.connect();
  const r = await c.query('SELECT container_number, belonged_month, belonged_quarter FROM orders WHERE container_number = $1', [cn]);
  console.log('DB_ROW=' + JSON.stringify(r.rows[0] || null));
  await c.end();
}
main().catch(err => { console.error(err); process.exit(1); });
