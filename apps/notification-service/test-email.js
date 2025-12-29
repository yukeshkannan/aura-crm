const dotenv = require('dotenv');
dotenv.config();
const { sendEmail } = require('./utils/emailProvider');

(async () => {
    console.log("Testing Email...");
    const result = await sendEmail("test@example.com", "Test Subject", "<p>Test</p>");
    console.log("Result:", result);
})();
