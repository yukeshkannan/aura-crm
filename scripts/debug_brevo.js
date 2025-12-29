const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config({ path: 'apps/auth-service/.env' });

const debugBrevo = async () => {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const accountApi = new SibApiV3Sdk.AccountApi();
    const sendersApi = new SibApiV3Sdk.SendersApi();

    console.log("--- DEBUGGING BREVO ACCOUNT ---");

    try {
        // 1. Check Account Details
        const account = await accountApi.getAccount();
        console.log("✅ Account Connected.");
        console.log(`   - Email: ${account.email}`);
        console.log(`   - First Name: ${account.firstName}`);
        console.log(`   - Plan: ${account.plan.length > 0 ? account.plan[0].type : 'Free'}`);
        console.log(`   - Credits: ${account.plan.length > 0 ? account.plan[0].credits : 'N/A'}`);
    } catch (error) {
        console.error("❌ Failed to get Account details:", error.message);
    }

    try {
        // 2. Check Verified Senders
        const senders = await sendersApi.getSenders();
        console.log("\n--- VERIFIED SENDERS ---");
        senders.senders.forEach(s => {
            console.log(`   - ${s.email} (Active: ${s.active})`);
        });

        const configuredSender = process.env.SENDER_EMAIL;
        console.log(`\n🔎 Configured SENDER_EMAIL in .env: "${configuredSender}"`);
        
        const isVerified = senders.senders.some(s => s.email === configuredSender && s.active);
        if (isVerified) {
            console.log("✅ Configured Sender IS verified.");
        } else {
            console.log("❌ Configured Sender is NOT verified or NOT found in the list.");
            console.log("   -> Emails sent from this address will likely be blocked or dropped.");
        }

    } catch (error) {
        console.error("❌ Failed to get Senders:", error.message);
    }
};

debugBrevo();
