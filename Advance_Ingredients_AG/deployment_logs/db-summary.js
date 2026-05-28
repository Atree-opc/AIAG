const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'project_user',
  password: 'Rand0mStr@ng',
  database: 'project_db'
});

(async () => {
  await client.connect();
  const version = (await client.query('SHOW server_version')).rows[0].server_version;
  const tableCount = (await client.query("SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_schema='public'" )).rows[0].count;
  const tables = (await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name" )).rows.map(r => r.table_name);
  const rowStats = [];
  for (const t of tables) {
    const safe = '"public"."' + t.replace(/"/g, '""') + '"';
    const count = (await client.query('SELECT COUNT(*)::int AS count FROM ' + safe)).rows[0].count;
    rowStats.push({ table: t, count });
  }
  console.log(JSON.stringify({ version, tableCount, tables, rowStats }, null, 2));
  await client.end();
})().catch(async (err) => {
  console.error(err);
  try { await client.end(); } catch {}
  process.exit(1);
});
