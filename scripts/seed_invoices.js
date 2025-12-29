const axios = require('axios');
const mongoose = require('mongoose');

// Helper to generate a dummy object ID if you don't have one, 
// BUT in real usage, you should use a REAL Contact ID from your database.
const dummyContactId = new mongoose.Types.ObjectId();

const invoices = [
  {
    customerId: dummyContactId,
    customerName: 'Tech Solutions Inc',
    customerEmail: 'admin@techsolutions.com',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    totalAmount: 4000,
    status: 'Draft',
    items: [
      { description: 'Consulting Services', quantity: 10, price: 100 },
      { description: 'Server Setup', quantity: 1, price: 3000 }
    ]
  },
  {
    customerId: dummyContactId,
    customerName: 'StartUp Hub',
    customerEmail: 'ceo@startuphub.io',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    totalAmount: 1500,
    status: 'Sent',
    items: [
      { description: 'Logo Design', quantity: 1, price: 500 },
      { description: 'Website Formatting', quantity: 1, price: 1000 }
    ]
  }
];

const seedInvoices = async () => {
  console.log('🌱 Starting to seed invoices...');
  console.log('ℹ️  Note: This script uses dummy Contact IDs. In a real scenario, use actual IDs from the Contact Service.');
  
  try {
    for (const invoice of invoices) {
      try {
        await axios.post('http://localhost:5000/api/invoices', invoice);
        console.log(`✅ Created Invoice for: ${invoice.customerName}`);
      } catch (error) {
         console.log(`❌ Failed: ${invoice.customerName} - ${error.message}`);
         if(error.response) console.log(error.response.data);
      }
    }
    console.log('✨ Invoice seeding completed!');
  } catch (err) {
    console.error('Fatal Error:', err.message);
    console.log('👉 Make sure the server is running with "npm run start:all"');
  }
};

seedInvoices();
