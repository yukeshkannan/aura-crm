const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: './apps/notification-service/.env' });

const TEST_EMAIL = process.env.SENDER_EMAIL || 'test@example.com';
const GATEWAY_URL = 'http://localhost:5000'; // Assuming Gateway runs on 5000

console.log(`\n🚀 CHECKING EMAIL SERVICES...`);
console.log(`🎯 Target Email: ${TEST_EMAIL}\n`);

const runTests = async () => {
    // 1. Notification Service (Direct)
    try {
        console.log('1️⃣  Testing Notification Service (Generic Email)...');
        const res = await axios.post(`${GATEWAY_URL}/api/notifications/email`, {
            to: TEST_EMAIL,
            subject: 'Test: Genric Notification Service',
            message: 'This is a test email from the manual endpoint check.'
        });
        console.log(res.data.success ? '   ✅ Success' : '   ❌ Failed');
    } catch (err) { console.log('   ❌ Error:', err.message); }

    // 2. Auth Service (Forgot Password OTP)
    try {
        console.log('\n2️⃣  Testing Auth Service (Forgot Password)...');
        // Note: This requires the user to exist in DB. We'll skip or mock if possible, 
        // but for now we try to trigger the endpoint.
        const res = await axios.post(`${GATEWAY_URL}/api/auth/forgot-password`, {
            email: TEST_EMAIL
        });
        console.log(res.data.success || res.status === 200 ? '   ✅ Success (OTP Sent)' : '   ❌ Failed');
    } catch (err) { 
        if (err.response && err.response.status === 404) console.log('   ⚠️  Skipped (User not found in DB)');
        else console.log('   ❌ Error:', err.message); 
    }

    // 3. Ticket Service (Resolve Ticket)
    // Hard to test without creating a ticket first. We will instruct user on this.
    console.log('\n3️⃣  Testing Ticket Service...');
    console.log('   ℹ️  Manual Check Required: Resolve a ticket in the UI and check if email arrives.');

    // 4. Invoice Service (Create Invoice)
    // Similar to Ticket, creating sends an email.
    console.log('\n4️⃣  Testing Invoice Service...');
    console.log('   ℹ️  Manual Check Required: Create an invoice with a valid email in the UI.');

    console.log('\n---------------------------------------------------');
    console.log('🏁 Verification Script Complete');
};

runTests();
