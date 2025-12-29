const { mongoose } = require('../../../packages/database');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave', 'Half-Day'],
    default: 'Present'
  },
  totalHours: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index to ensure one record per user per day (optional but good practice)
// attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
