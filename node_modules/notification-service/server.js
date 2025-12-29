const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const notificationRoutes = require('./routes/notificationRoutes');
const initScheduledJobs = require('./jobs/checkOverdueTasks');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routers
app.use('/api/notifications', notificationRoutes);

// Start Scheduler
initScheduledJobs();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
