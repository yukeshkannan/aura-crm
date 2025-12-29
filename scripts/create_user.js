const mongoose = require('mongoose');
const User = require('../apps/auth-service/models/User'); 

// CHANGE THESE DETAILS TO WHAT YOU WANT
const NEW_USER = {
  name: "My Name",           // <--- Change this
  email: "myemail@test.com", // <--- Change this
  password: "mypassword123", // <--- Change this
  role: "Employee",          // Options: 'Admin', 'Employee', 'Sales', 'HR'
  designation: "Developer",
  department: "Tech"
};

const MONGO_URI = 'mongodb+srv://yukesh:yukesh1234@yukesh.5dylhhw.mongodb.net/companycrm?appName=Yukesh';

const createUser = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const userExists = await User.findOne({ email: NEW_USER.email });
    if (userExists) {
      console.log(`❌ User with email ${NEW_USER.email} already exists!`);
      process.exit(1);
    }

    const user = new User(NEW_USER);
    await user.save();
    
    console.log('\n✅ User Created Successfully!');
    console.log('--------------------------------');
    console.log(`Name:     ${user.name}`);
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${NEW_USER.password}`);
    console.log('--------------------------------');
    console.log('You can now login with these credentials.');

    process.exit();
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
};

createUser();
