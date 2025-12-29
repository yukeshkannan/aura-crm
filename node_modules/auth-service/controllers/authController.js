const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');
const { formatResponse } = require('utils'); 

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, designation, department } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return formatResponse(res, 400, 'User already exists');
    }

    // Force role to be Employee for public registration
    const user = await User.create({
      name, 
      email, 
      password, 
      role: 'Client', 
      designation, 
      department
    });

    formatResponse(res, 201, 'User registered successfully', { userId: user._id, email: user.email, role: user.role });
  } catch (error) {
    formatResponse(res, 500, error.message);
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      formatResponse(res, 200, 'Login successful', { 
        token, 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      formatResponse(res, 401, 'Invalid email or password');
    }
  } catch (error) {
    formatResponse(res, 500, error.message);
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return formatResponse(res, 404, 'User not found');

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("DEBUG OTP:", otp); // Log OTP for testing
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const emailSent = await sendOTPEmail(email, otp);
    if (emailSent) {
      formatResponse(res, 200, 'OTP sent to email');
    } else {
      formatResponse(res, 500, 'Failed to send email');
    }
  } catch (error) {
    formatResponse(res, 500, error.message);
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return formatResponse(res, 400, 'Passwords do not match');
    }

    const user = await User.findOne({ 
      email, 
      resetPasswordOtp: otp, 
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return formatResponse(res, 400, 'Invalid or expired OTP');
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    formatResponse(res, 200, 'Password reset successfully');
  } catch (error) {
    formatResponse(res, 500, error.message);
  }
};

// Create User (Admin Only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, designation, department, salary } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return formatResponse(res, 400, 'User already exists');
    }

    const user = await User.create({
      name, 
      email, 
      password, 
      role, 
      designation, 
      department,
      salary // Add salary
    });

    formatResponse(res, 201, 'User created successfully', { userId: user._id, email: user.email, role: user.role });
  } catch (error) {
    formatResponse(res, 500, error.message);
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { mongoose } = require('database');
    console.log("Fetching all users [DEBUG]... Connection State:", mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
       throw new Error(`Database not connected. State: ${mongoose.connection.readyState}`);
    }
    // Attempt simple find
    const users = await User.find({});
    console.log(`Found ${users ? users.length : 0} users`);
    
    // Direct response to debug
    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
  } catch (error) {
    console.error("Error in getAllUsers [DEBUG]:", error);
    // Direct error response
    res.status(500).json({
        success: false,
        message: error.message,
        stack: error.stack
    });
  }
};

// Update User (Admin Only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, designation, department, salary } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return formatResponse(res, 404, 'User not found');
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.designation = designation || user.designation;
    user.department = department || user.department;
    if (salary) user.salary = salary; // Add salary update

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    formatResponse(res, 200, 'User updated successfully', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
        salary: user.salary
    });
  } catch (error) {
    formatResponse(res, 500, error.message);
  }
};

// Delete User (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return formatResponse(res, 404, 'User not found');
    }

    await user.deleteOne();
    formatResponse(res, 200, 'User deleted successfully');
  } catch (error) {
    formatResponse(res, 500, error.message);
  }
};
