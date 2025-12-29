const mongoose = require('mongoose');

const connectDB = async (uri) => {
  if (!uri) {
    console.error('MongoDB URI is missing');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
