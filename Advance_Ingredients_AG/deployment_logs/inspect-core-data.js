const { Client } = require('pg');
(async () => {
  const c = new Client({ host: '127.0.0.1', port: 5432, user: 'project_user', password: 'Rand0mStr@ng', database: 'project_db' });
  await c.connect();
  const queries = {
    users_by_role: "SELECT role, COUNT(*)::int AS count FROM users GROUP BY role ORDER BY role",
    role_fields: "SELECT role, COUNT(*)::int AS count FROM role_field_visibility GROUP BY role ORDER BY role",
    hard_denied: "SELECT COUNT(*)::int AS count FROM hard_denied_info",
    order_options: "SELECT option_type, COUNT(*)::int AS count FROM order_options GROUP BY option_type ORDER BY option_type"
  };
  for (const [name, sql] of Object.entries(queries)) {
    const r = await c.query(sql);
    console.log('## ' + name);
    console.log(JSON.stringify(r.rows, null, 2));
  }
  await c.end();
})().catch(err => { console.error(err); process.exit(1); });
