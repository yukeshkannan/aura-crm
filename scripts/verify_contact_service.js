const http = require('http');

const PORT = 5002;
const BASE_URL = `http://localhost:${PORT}/api/contacts`;

// Helper function to make HTTP requests
const request = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api/contacts${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          // Check if body is empty
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
            console.error('Error parsing JSON:', body);
            resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runVerification = async () => {
  console.log(`\n🚀 Starting Verification for Contact Service on Port ${PORT}...\n`);

  try {
    // 1. GET ALL (Should be empty or existing)
    console.log('1️⃣  Testing GET / (List Contacts)...');
    const listRes = await request('GET', '/');
    console.log(`   Status: ${listRes.status}`);
    console.log(`   Count: ${listRes.data.data ? listRes.data.data.length : 0}`);
    if (listRes.status !== 200) throw new Error('Failed to list contacts');
    console.log('   ✅ Passed\n');

    // 2. CREATE
    console.log('2️⃣  Testing POST / (Create Contact)...');
    const newContact = {
      name: "Verification Bot",
      email: `macha.bot.${Date.now()}@test.com`,
      phone: "1234567890",
      company: "Test Corp"
    };
    const createRes = await request('POST', '/', newContact);
    console.log(`   Status: ${createRes.status}`);
    if (createRes.status !== 201) throw new Error(`Failed to create contact: ${JSON.stringify(createRes.data)}`);
    const createdId = createRes.data.data._id;
    console.log(`   Created ID: ${createdId}`);
    console.log('   ✅ Passed\n');

    // 3. GET SINGLE
    console.log(`3️⃣  Testing GET /${createdId} (Get Single)...`);
    const getRes = await request('GET', `/${createdId}`);
    console.log(`   Status: ${getRes.status}`);
    if (getRes.status !== 200 || getRes.data.data.email !== newContact.email) throw new Error('Failed to get contact');
    console.log('   ✅ Passed\n');

    // 4. UPDATE
    console.log(`4️⃣  Testing PUT /${createdId} (Update Status)...`);
    const updateRes = await request('PUT', `/${createdId}`, { status: 'Qualified' });
    console.log(`   Status: ${updateRes.status}`);
    if (updateRes.status !== 200 || updateRes.data.data.status !== 'Qualified') throw new Error('Failed to update contact');
    console.log('   ✅ Passed\n');

    // 5. DELETE
    console.log(`5️⃣  Testing DELETE /${createdId} (Delete)...`);
    const deleteRes = await request('DELETE', `/${createdId}`);
    console.log(`   Status: ${deleteRes.status}`);
    if (deleteRes.status !== 200) throw new Error('Failed to delete contact');
    console.log('   ✅ Passed\n');

    console.log('🎉 All Verification Steps Passed Successfully!');

  } catch (error) {
    console.error(`\n❌ Verification Failed: ${error.message}`);
    console.log('   Is the server running? (node apps/contact-service/server.js)');
  }
};

runVerification();
