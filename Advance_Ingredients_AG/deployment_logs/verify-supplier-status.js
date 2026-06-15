const { Client } = require('pg');
(async () => {
  const c = new Client({ host: '127.0.0.1', port: 5432, user: 'project_user', password: 'Rand0mStr@ng', database: 'project_db' });
  await c.connect();
  const r = await c.query("SELECT role, field_key, editable FROM role_field_visibility WHERE role='supplier' AND field_key='status'");
  console.log(JSON.stringify(r.rows, null, 2));
  await c.end();
})().catch(err => { console.error(err); process.exit(1); });
