const Attendance = require('../models/Attendance');

// Check In
exports.checkIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there is an ACTIVE session for today (checkOut is null or undefined)
    const openSession = await Attendance.findOne({ 
        userId, 
        date: today, 
        checkOut: { $exists: false } 
    });

    if (openSession) {
      // Idempotent success - return existing open session
      return res.status(200).json({ success: true, message: 'Already checked in', data: openSession });
    }

    // Create NEW session (even if others exist for today)
    const attendance = await Attendance.create({
      userId,
      date: today,
      checkIn: new Date(),
      status: 'Present'
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check Out
exports.checkOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the LATEST record for today
    const attendance = await Attendance.findOne({ userId, date: today })
        .sort({ createdAt: -1 });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
        return res.status(400).json({ success: false, message: 'No active session (already checked out)' });
    }

    const checkOutTime = new Date();
    attendance.checkOut = checkOutTime;
    
    // Calculate total hours
    const durationMs = checkOutTime - new Date(attendance.checkIn);
    const hours = durationMs / (1000 * 60 * 60);
    attendance.totalHours = hours.toFixed(2);

    await attendance.save();

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('[checkOut] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Attendance
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Attendance (User / All)
exports.getAttendance = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) query.userId = userId;

    const records = await Attendance.find(query)
        .sort({ date: -1, createdAt: -1 })
        .populate('userId', 'name email role department designation');
    
    // Debug logging
    console.log(`[getAttendance] Found ${records.length} records`);
    records.forEach(r => {
        if (!r.userId) {
            console.warn(`[getAttendance] Record ${r._id} has userId=${r.userId} which failed to populate. Original ID might be stored but unresolvable.`);
        }
    });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
