const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../apps/auth-service/models/User'); // Adjust path to your User model
const connectDB = require('../packages/database'); // Adjust path to your DB connection

dotenv.config({ path: 'apps/auth-service/.env' }); // Load env variables

const createAdmin = async () => {
    try {
        await connectDB(process.env.MONGO_URI);

        const args = process.argv.slice(2);
        if (args.length < 3) {
            console.log('Usage: node scripts/create_admin.js <name> <email> <password>');
            process.exit(1);
        }

        const [name, email, password] = args;

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('❌ User already exists with this email.');
            process.exit(1);
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'Admin', // This is the only place we allow creating an Admin
            designation: 'System Administrator',
            department: 'IT'
        });

        console.log('✅ Admin User Created Successfully!');
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
