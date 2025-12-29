require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const verify = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find().limit(5);
        console.log(`Found ${users.length} users`);
        if (users.length > 0) {
            console.log('Sample User:', users[0].name, users[0].email, users[0]._id);
        } else {
            console.log('No users found. This is unexpected if this is the main Cloud DB.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();
