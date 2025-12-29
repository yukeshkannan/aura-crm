const mongoose = require('mongoose');
const User = require('../apps/auth-service/models/User'); 

const MONGO_URI = 'mongodb+srv://yukesh:yukesh1234@yukesh.5dylhhw.mongodb.net/companycrm?appName=Yukesh';

const seedUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create Admin
    const adminExists = await User.findOne({ email: 'admin@company.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'admin123', 
        role: 'Admin',
        designation: 'System Administrator',
        department: 'IT'
      });
      await admin.save();
      console.log('✅ Admin user created: admin@company.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create Employee
    const empExists = await User.findOne({ email: 'employee@company.com' });
    if (!empExists) {
      const emp = new User({
        name: 'John Doe',
        email: 'employee@company.com',
        password: 'employee123', 
        role: 'Employee',
        designation: 'Software Engineer',
        department: 'Engineering'
      });
      await emp.save();
      console.log('✅ Employee user created: employee@company.com / employee123');
    } else {
        console.log('ℹ️ Employee user already exists');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
