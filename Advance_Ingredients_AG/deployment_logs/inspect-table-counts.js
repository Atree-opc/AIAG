const { Client } = require('pg');
(async () => {
  const c = new Client({ host: '127.0.0.1', port: 5432, user: 'project_user', password: 'Rand0mStr@ng', database: 'project_db' });
  await c.connect();
  const tables = ['users','orders','order_visibility','order_files','role_field_visibility','hard_denied_info','order_options','accountant_files','order_month','order_quarter'];
  for (const t of tables) {
    const r = await c.query(`SELECT COUNT(*)::int AS count FROM ${t}`);
    console.log(`${t}=${r.rows[0].count}`);
  }
  await c.end();
})().catch(err => { console.error(err); process.exit(1); });
