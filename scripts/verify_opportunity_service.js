const http = require('http');

const PORT = 5003;
const BASE_URL = `http://localhost:${PORT}/api/opportunities`;

// Helper to generate a random MongoDB-like ObjectId
const generateObjectId = () => {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16)).toLowerCase();
};

const DUMMY_CONTACT_ID = generateObjectId();

// Helper function to make HTTP requests
const request = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api/opportunities${path}`,
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
  console.log(`\n🚀 Starting Verification for Opportunity Service on Port ${PORT}...\n`);

  try {
    // 1. GET ALL
    console.log('1️⃣  Testing GET / (List Opportunities)...');
    const listRes = await request('GET', '/');
    console.log(`   Status: ${listRes.status}`);
    if (listRes.status !== 200) throw new Error('Failed to list opportunities');
    console.log('   ✅ Passed\n');

    // 2. CREATE
    console.log('2️⃣  Testing POST / (Create Opportunity)...');
    const newOpportunity = {
      title: "Test Deal from Script",
      amount: 75000,
      stage: "New",
      contactId: DUMMY_CONTACT_ID 
    };
    const createRes = await request('POST', '/', newOpportunity);
    console.log(`   Status: ${createRes.status}`);
    if (createRes.status !== 201) throw new Error(`Failed to create: ${JSON.stringify(createRes.data)}`);
    const createdId = createRes.data.data._id;
    console.log(`   Created ID: ${createdId}`);
    console.log('   ✅ Passed\n');

    // 3. GET SINGLE
    console.log(`3️⃣  Testing GET /${createdId} (Get Single)...`);
    const getRes = await request('GET', `/${createdId}`);
    console.log(`   Status: ${getRes.status}`);
    if (getRes.status !== 200) throw new Error('Failed to get opportunity');
    console.log('   ✅ Passed\n');

    // 4. UPDATE
    console.log(`4️⃣  Testing PUT /${createdId} (Update Stage)...`);
    const updateRes = await request('PUT', `/${createdId}`, { stage: 'Won', amount: 80000 });
    console.log(`   Status: ${updateRes.status}`);
    if (updateRes.status !== 200 || updateRes.data.data.stage !== 'Won') throw new Error('Failed to update');
    console.log('   ✅ Passed\n');

    // 5. DELETE
    console.log(`5️⃣  Testing DELETE /${createdId} (Delete)...`);
    const deleteRes = await request('DELETE', `/${createdId}`);
    console.log(`   Status: ${deleteRes.status}`);
    if (deleteRes.status !== 200) throw new Error('Failed to delete');
    console.log('   ✅ Passed\n');

    console.log('🎉 All Opportunity Verification Steps Passed!');

  } catch (error) {
    console.error(`\n❌ Verification Failed: ${error.message}`);
    console.log('   Is the server running? (node apps/opportunity-service/server.js)');
  }
};

runVerification();
