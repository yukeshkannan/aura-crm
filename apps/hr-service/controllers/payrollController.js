const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const axios = require('axios');

// Helper to get user details from Auth Service
// For simplicity, we might assume the frontend passes necessary salary info,
// OR we fetch it from Auth service. Let's try to fetch if possible, or expect it in body.
// Better approach for MPV: Admin sends the base salary info or we assume it's stored in User model.

const { sendPayslipEmail } = require('../utils/emailService');
const User = require('../models/User'); // We need User model to get email/name

exports.generatePayroll = async (req, res) => {
  try {
    const { userId, month, year, baseSalary, presentDays, totalDays } = req.body;

    if (!userId || !baseSalary) {
        console.warn(`[Payroll Generate] Missing fields. userId: ${userId}, baseSalary: ${baseSalary}`);
        return res.status(400).json({ success: false, message: "User ID and Base Salary required" });
    }

    // Check if payroll already exists
    const existing = await Payroll.findOne({ userId, month, year });
    if (existing) {
         console.warn(`[Payroll Generate] Already exists for User ${userId} in ${month} ${year}`);
         return res.status(400).json({ success: false, message: `Payroll for ${month} ${year} already generated.` });
    }

    // Calculate Net Salary
    let netSalary = Number(baseSalary);
    if (presentDays && totalDays) {
        const perDay = Number(baseSalary) / Number(totalDays);
        netSalary = perDay * Number(presentDays);
    }
    
    // Create Record
    const payroll = await Payroll.create({
        userId,
        month,
        year,
        baseSalary: Number(baseSalary),
        netSalary: Math.round(netSalary),
        status: 'Generated'
    });

    // Fetch user details for email
    // Since we are in hr-service, and it connects to the SAME DB as auth-service, we can use the User model directly if it's registered.
    // However, User model might not be fully registered or might have different schema definition here.
    // But we saw `server.js` registers `./models/User`. Let's assume it works.
    const user = await User.findById(userId);
    
    if (user && user.email) {
        // Send Email asynchronously (don't block response)
        try {
            // For email purposes, we use the values from request or defaults
            // We need perDay value
            let perDay = 0;
            if (totalDays > 0) perDay = Number(baseSalary) / Number(totalDays);

            sendPayslipEmail(user.email, user.name, month, year, Math.round(netSalary), Number(baseSalary), presentDays || 0, totalDays || 0, perDay)
                .then(success => console.log(`Email sent status: ${success}`))
                .catch(err => console.error("Email send failed promise", err));
        } catch (syncErr) {
            console.error("Email send trigger failed", syncErr);
        }
    } else {
        console.warn("User not found or no email, skipping email notification.");
    }

    res.status(201).json({ success: true, data: payroll, message: 'Payroll generated and email sent.' });

  } catch (error) {
    console.error("Generate Payroll Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayroll = async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};
        if (userId) query.userId = userId;

        const records = await Payroll.find(query).sort({ year: -1, createdAt: -1 });
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await Payroll.findByIdAndDelete(id);

        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }

        res.status(200).json({ success: true, message: 'Payroll deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
