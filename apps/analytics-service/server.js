const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routers
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Analytics Service running on port ${PORT}`);
});
