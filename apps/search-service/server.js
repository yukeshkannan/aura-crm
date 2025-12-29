const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const searchRoutes = require('./routes/searchRoutes');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routers
app.use('/api/search', searchRoutes);

const PORT = process.env.PORT || 5011;

const server = app.listen(PORT, () => {
  console.log(`Search Service running on port ${PORT}`);
});
