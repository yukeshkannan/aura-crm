const express = require('express');
const cors = require('cors');
const { connectDB } = require('../../packages/database');
require('dotenv').config();

// Register Models
require('./models/User');
require('./models/Attendance');
require('./models/Payroll');

const app = express();
const PORT = process.env.PORT || 5012; 

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[HR Service] ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));

// Connect to Database and Start Server
const startServer = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT, () => console.log(`HR Service running on port ${PORT}`));
    } catch (err) {
        console.error('Failed to start HR Service:', err);
    }
};

startServer();
