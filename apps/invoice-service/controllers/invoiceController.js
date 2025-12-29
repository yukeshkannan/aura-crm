const Invoice = require('../models/Invoice');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const logError = (msg) => {
    fs.appendFileSync(path.join(__dirname, '../error.log'), new Date().toISOString() + ': ' + msg + '\n');
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Public
exports.getInvoices = async (req, res) => {
  console.log("🔥 HIT: getInvoices"); // Debug Log
  try {
    const invoices = await Invoice.find();
    console.log(`✅ Retrieved ${invoices.length} invoices`);
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (err) {
    console.error("💥 CRASH in getInvoices:", err);
    logError("CRASH in getInvoices: " + err.stack);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + err.message
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Public
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Public
exports.createInvoice = async (req, res) => {
    console.log("🔥 HIT: createInvoice");
    try {
        console.log("PAYLOAD:", req.body);
        // Create simplest invoice possible to test
        const invoice = new Invoice(req.body);
        await invoice.save();
        
        console.log("✅ SAVED");
        res.status(201).json({ success: true, data: invoice });
    } catch (err) {
        console.error("💥 CRASH:", err);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id
// @access  Public
exports.updateInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Public
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Send Invoice via Email
// @route   POST /api/invoices/:id/send
// @access  Public
exports.sendInvoiceEmail = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

        if (!invoice.customerEmail) {
            return res.status(400).json({ success: false, error: 'Customer email is missing' });
        }

        // Construct Email HTML
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">Invoice #${invoice._id.toString().slice(-6).toUpperCase()}</h2>
                <p>Dear ${invoice.customerName},</p>
                <p>Please find below the details of your invoice. We appreciate your business!</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr style="background-color: #f8fafc; text-align: left;">
                        <th style="padding: 10px; border-bottom: 2px solid #ddd;">Description</th>
                        <th style="padding: 10px; border-bottom: 2px solid #ddd;">Qty</th>
                        <th style="padding: 10px; border-bottom: 2px solid #ddd;">Total</th>
                    </tr>
                    ${invoice.items.map(item => `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </table>

                <div style="margin-top: 20px; text-align: right;">
                    <h3 style="color: #0f172a;">Total Due: $${invoice.totalAmount.toFixed(2)}</h3>
                    <p style="color: #64748b; font-size: 14px;">Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>

                <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">
                    <p>Thank you for choosing us.</p>
                </div>
            </div>
        `;

        // Call Notification Service
        const NOTIFICATION_SERVICE = 'http://localhost:5005/api/notifications/email'; // Direct Service URL
        
        await axios.post(NOTIFICATION_SERVICE, {
            to: invoice.customerEmail,
            subject: `Invoice #${invoice._id.toString().slice(-6).toUpperCase()} from Company`,
            message: emailContent
        });

        // Update Status to 'Sent' if it was 'Draft'
        if (invoice.status === 'Draft') {
            invoice.status = 'Sent';
            await invoice.save();
        }

        res.status(200).json({ success: true, message: 'Invoice sent successfully', data: invoice });

    } catch (err) {
        console.error("❌ Send Invoice Error:", err.message);
        if (err.response) {
            console.error("Response Status:", err.response.status);
            console.error("Response Data:", err.response.data);
        }
        logError("Send Invoice Error: " + err.stack);
        res.status(500).json({ success: false, error: 'Failed to send invoice email' });
    }
};
