const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const documentRoutes = require('./routes/documentRoutes');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routers
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 5007;

app.listen(PORT, () => {
  console.log(`Document Service running on port ${PORT}`);
});
