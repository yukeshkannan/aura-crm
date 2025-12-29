const { mongoose } = require('../../../packages/database');

const payrollSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String, // e.g., "January"
    required: true
  },
  year: {
    type: Number, // e.g., 2025
    required: true
  },
  baseSalary: {
    type: Number,
    required: true
  },
  allowances: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Generated', 'Paid'],
    default: 'Generated'
  },
  details: {
    type: String // Optional: JSON string or text for breakdown
  }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
