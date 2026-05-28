const { Client } = require('pg');
(async () => {
  const c = new Client({ host: '127.0.0.1', port: 5432, user: 'project_user', password: 'Rand0mStr@ng', database: 'project_db' });
  await c.connect();
  const perms = await c.query("SELECT role, field_key, editable FROM role_field_visibility WHERE role='staff' AND field_key IN ('belonged_month','belonged_quarter') ORDER BY field_key");
  const recent = await c.query("SELECT container_number, belonged_month, belonged_quarter, created_at FROM orders ORDER BY created_at DESC LIMIT 5");
  console.log('PERMS=' + JSON.stringify(perms.rows, null, 2));
  console.log('RECENT=' + JSON.stringify(recent.rows, null, 2));
  await c.end();
})().catch(err => { console.error(err); process.exit(1); });
