const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');
const { sendInvoiceEmail } = require('./controllers/invoiceController');
const dotenv = require('dotenv');

dotenv.config();

// Mock Express Request and Response
const req = {
    params: { id: '676451698a6639645bae75cd' }, // Replace with a valid ID from the user logs if possible, or we will query one
    body: {}
};

const res = {
    status: (code) => {
        console.log(`[Response Status]: ${code}`);
        return res;
    },
    json: (data) => {
        console.log('[Response Data]:', JSON.stringify(data, null, 2));
        return res;
    }
};

(async () => {
    try {
        console.log("Connecting to DB...");
        // Ensure MONGO_URI is set or use a default common one if safe
        const mongoUri = process.env.MONGO_URI || 'mongodb+srv://admin:Admin123@ac-xwpz1zi-shard-00-00.5dylhhw.mongodb.net/crm_db?retryWrites=true&w=majority';
        await mongoose.connect(mongoUri);
        console.log("Connected to DB.");

        // Find a valid invoice first
        const invoice = await Invoice.findOne();
        if (!invoice) {
            console.error("No invoices found in DB to test with.");
            process.exit(1);
        }
        
        console.log(`Testing with Invoice ID: ${invoice._id}`);
        req.params.id = invoice._id;

        // Call the controller
        await sendInvoiceEmail(req, res);

    } catch (error) {
        console.error("CRITICAL ERROR:", error);
    } finally {
        await mongoose.disconnect();
    }
})();
