const http = require('http');

const loginData = JSON.stringify({
  email: 'admin@acme.com',
  password: 'Admin@123',
  tenantSubdomain: 'acme'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    if (result.token) console.log(`Token: ${result.token.substring(0, 20)}...`);
    if (result.user) console.log(`User: ${result.user.email}`);
  });
});

req.on('error', (e) => { console.error(`Error: ${e.message}`); });
req.write(loginData);
req.end();
