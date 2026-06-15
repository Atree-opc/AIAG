const jwt = require('jsonwebtoken');
const secret = '6f83d57419676ea4bb702a26f44dd4a1b3668db7a51859d06445968b5d7a8c7a';
const token = jwt.sign({ userId: '00000000-0000-0000-0000-000000000999', role: 'admin', name: 'admin' }, secret, { expiresIn: '5m' });
const name = 'acct_' + Date.now();
(async () => {
  const res = await fetch('http://localhost:3050/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'token=' + token,
    },
    body: JSON.stringify({ name, role: 'accountant', password: 'acc123456' })
  });
  console.log('STATUS=' + res.status);
  console.log(await res.text());
})().catch(err => { console.error(err); process.exit(1); });
