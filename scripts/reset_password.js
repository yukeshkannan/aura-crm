const mongoose = require('mongoose');
const User = require('../apps/auth-service/models/User');

const MONGO_URI = 'mongodb+srv://yukesh:yukesh1234@yukesh.5dylhhw.mongodb.net/companycrm?appName=Yukesh';

const resetPassword = async () => {
  try {
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.log('Usage: node scripts/reset_password.js <email> <new_password>');
      process.exit(1);
    }

    const [email, newPassword] = args;

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }

    user.password = newPassword;
    await user.save(); // This will trigger the bcrypt pre-save hook

    console.log(`✅ Password updated successfully for ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
