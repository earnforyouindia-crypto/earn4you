const axios = require('axios');

async function testLogin() {
  const API_URL = 'http://localhost:3000/api'; // Or whatever host is used
  const credentials = {
    phone: '919999999999',
    password: 'AdminPass123'
  };

  try {
    console.log(`Attempting login for: ${credentials.phone}...`);
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    console.log('Login Successful! ✅');
    console.log('Response:', response.data);
  } catch (err) {
    console.log('Login Failed! ❌');
    if (err.response) {
        console.log(`Status: ${err.response.status}`);
        console.log('Message:', err.response.data.message);
    } else {
        console.log('Error:', err.message);
    }
  }
}

testLogin();
