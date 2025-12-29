const connectDB = require('database');
const User = require('./models/User');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log("Testing DB Connection...");
console.log("MONGO_URI present:", !!process.env.MONGO_URI);

const run = async () => {
  try {
    // 1. Connect
    await connectDB(process.env.MONGO_URI);
    
    // 2. Check State
    console.log("Mongoose Connection State:", mongoose.connection.readyState);
    
    if (mongoose.connection.readyState !== 1) {
        console.error("Mongoose is NOT connected.");
    } else {
        console.log("Mongoose IS connected.");
    }

    // 3. Query
    const count = await User.countDocuments();
    console.log(`User count: ${count}`);
    
  } catch (error) {
    console.error("Test Failed:", error);
  } finally {
    process.exit();
  }
};

run();
