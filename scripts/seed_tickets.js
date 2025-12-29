const axios = require('axios');
const mongoose = require('mongoose');

// Dummy Contact ID
const dummyContactId = new mongoose.Types.ObjectId();

const tickets = [
  {
    customerId: dummyContactId,
    title: 'Login Page Crash',
    description: 'When I try to login with Google, the page crashes.',
    priority: 'Critical',
    status: 'Open',
    assignedTo: 'Dev Team'
  },
  {
    customerId: dummyContactId,
    title: 'Invoice Amount Wrong',
    description: 'The total calculation in invoice #INV-002 is incorrect.',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Finance Team'
  },
  {
    customerId: dummyContactId,
    title: 'Feature Request: Dark Mode',
    description: 'Can we have a dark mode option for the dashboard?',
    priority: 'Low',
    status: 'Open',
    assignedTo: 'Product Manager'
  },
  {
    customerId: dummyContactId,
    title: 'Typo in Welcome Email',
    description: 'The word "Welcome" is spelled as "Welocme".',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Content Team'
  }
];

const seedTickets = async () => {
  console.log('🌱 Starting to seed tickets...');
  
  try {
    for (const ticket of tickets) {
      try {
        await axios.post('http://localhost:5000/api/tickets', ticket);
        console.log(`✅ Created Ticket: ${ticket.title}`);
      } catch (error) {
         console.log(`❌ Failed: ${ticket.title} - ${error.message}`);
         if(error.response) console.log(error.response.data);
      }
    }
    console.log('✨ Ticket seeding completed!');
  } catch (err) {
    console.error('Fatal Error:', err.message);
    console.log('👉 Make sure the server is running with "npm run start:all"');
  }
};

seedTickets();
