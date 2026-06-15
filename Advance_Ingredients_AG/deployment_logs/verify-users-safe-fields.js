const jwt = require('jsonwebtoken');
const secret = '6f83d57419676ea4bb702a26f44dd4a1b3668db7a51859d06445968b5d7a8c7a';
const token = jwt.sign({ userId: '00000000-0000-0000-0000-000000000001', role: 'staff', name: 'staff' }, secret, { expiresIn: '5m' });
(async () => {
  const res = await fetch('http://localhost:3050/api/users', {
    headers: { Cookie: 'token=' + token }
  });
  const data = await res.json();
  console.log('STATUS=' + res.status);
  console.log(JSON.stringify(data.slice ? data.slice(0, 3) : data, null, 2));
})().catch(err => { console.error(err); process.exit(1); });
