const axios = require('axios');

const testLogin = async () => {
  const email = 'admin@company.com';
  const password = 'password123';

  console.log('Testing Direct Service (Port 5001)...');
  try {
    const res1 = await axios.post('http://localhost:5001/api/auth/login', { email, password });
    console.log('✅ Direct Login Success:', res1.status, res1.data.token ? 'Token Found' : 'No Token');
  } catch (err) {
    console.log('❌ Direct Login Failed:', err.response ? err.response.data : err.message);
  }

  console.log('\nTesting Gateway (Port 5000)...');
  try {
    const res2 = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    console.log('✅ Gateway Login Response Data:', JSON.stringify(res2.data, null, 2));
  } catch (err) {
    console.log('❌ Gateway Login Failed:', err.response ? err.response.data : err.message);
  }
};

testLogin();
