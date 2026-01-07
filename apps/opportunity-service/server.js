const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('../../packages/database');
const opportunityRoutes = require('./routes/opportunityRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`[Service] Received ${req.method} ${req.url}`);
    next();
});

app.use('/api/opportunities', opportunityRoutes);

const PORT = process.env.PORT || 5003;

const startServer = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT, () => console.log(`Opportunity Service running on port ${PORT}`));
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
