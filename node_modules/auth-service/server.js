const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('database'); // Shared package
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect Database
// Connect Database
// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  }
};

startServer();
