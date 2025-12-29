const cron = require('node-cron');
const axios = require('axios');
const { sendEmail } = require('../utils/emailProvider');

// Cron Job: Check for Overdue/Pending Tasks
// Schedule: Every Friday at 9:00 AM
const initScheduledJobs = () => {
  console.log('⏰ Scheduler Initialized: Checking for pending tasks every Friday at 9 AM...');
  
  cron.schedule('0 9 * * 5', async () => {
    console.log('\n🔄 Cron Job Started: Checking Pending Tasks...');
    try {
      // 1. Fetch Pending Tasks from Task Service via Gateway (or direct)
      // Using direct port 5004 to avoid circular dependency issues if Gateway is down
      const response = await axios.get('http://localhost:5004/api/tasks');
      
      if (!response.data.success) {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = response.data.data;
      const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');

      console.log(`   Found ${pendingTasks.length} pending tasks.`);

      // 2. Process each task
      for (const task of pendingTasks) {
          // In a real app, we would fetch User details to get their email.
          // For this Demo, we will use a dummy/admin email or the specific assignee email if available.
          // Simulating email sending to Admin for now.
          const adminEmail = process.env.SENDER_EMAIL; 
          
          if (adminEmail) {
            const subject = `Reminder: Task "${task.title}" is ${task.status}`;
            const html = `
                <h3>Task Reminder</h3>
                <p>Hello,</p>
                <p>The following task is still <b>${task.status}</b>:</p>
                <ul>
                    <li><b>Title:</b> ${task.title}</li>
                    <li><b>Priority:</b> ${task.priority}</li>
                    <li><b>Due Date:</b> ${task.dueDate ? new Date(task.dueDate).toDateString() : 'No Due Date'}</li>
                </ul>
                <p>Please update the status.</p>
            `;
            await sendEmail(adminEmail, subject, html);
          }
      }
      
    } catch (error) {
      console.error('❌ Cron Job Error:', error.message);
    }
  });
};

module.exports = initScheduledJobs;
