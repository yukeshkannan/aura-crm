const { mongoose } = require('../../../packages/database');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Employee', 'Sales', 'HR', 'Client'], 
    default: 'Client' 
  },
  designation: { type: String },
  department: { type: String },
  joiningDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
