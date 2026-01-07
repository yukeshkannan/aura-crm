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
    const { email } = req.query;
    let query = {};
    if (email) {
        query.customerEmail = email;
    }
    const invoices = await Invoice.find(query);
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
        const invoice = new Invoice(req.body);
        
        // Auto-set status to Sent since we are emailing immediately
        invoice.status = 'Sent';
        await invoice.save();
        
        console.log("✅ SAVED Invoice:", invoice._id);

        // --- EMAIL LOGIC START ---
        if (invoice.customerEmail) {
            try {
                const emailContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #2563eb;">Invoice #${invoice._id.toString().slice(-6).toUpperCase()}</h2>
                        <p>Dear ${invoice.customerName},</p>
                        <p>A new invoice has been generated for you.</p>
                        
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
                    </div>
                `;

                const NOTIFICATION_SERVICE = 'http://notification-service:5005/api/notifications/email';
                await axios.post(NOTIFICATION_SERVICE, {
                    to: invoice.customerEmail,
                    subject: `New Invoice #${invoice._id.toString().slice(-6).toUpperCase()} from Company`,
                    message: emailContent
                });
                console.log("📧 Email Sent to:", invoice.customerEmail);
            } catch (emailErr) {
                console.error("⚠️ Failed to send email (Invoice created anyway):", emailErr.message);
            }
        }
        // --- EMAIL LOGIC END ---

        res.status(201).json({ success: true, data: invoice, message: "Invoice created and sent!" });
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

    const originalStatus = invoice.status;

    invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // --- NOTIFICATION LOGIC: Payment Received ---
    if (req.body.status === 'Paid' && originalStatus !== 'Paid') {
        try {
             // Notify Admin
             const adminEmail = process.env.SENDER_EMAIL || "admin@companycrm.com";
             const NOTIFICATION_SERVICE = 'http://notification-service:5005/api/notifications/email'; // Direct Service URL
             
             const emailContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 10px; background-color: #f0fdf4;">
                    <h2 style="color: #047857;">Payment Received!</h2>
                    <p><strong>Invoice #${invoice._id.toString().slice(-6).toUpperCase()}</strong> has been marked as PAID.</p>
                    <p>
                        <strong>Ref:</strong> ${invoice._id}<br>
                        <strong>Amount:</strong> $${invoice.totalAmount.toFixed(2)}<br>
                        <strong>Customer:</strong> ${invoice.customerName}
                    </p>
                    <p>The system has updated the status automatically.</p>
                </div>
             `;

             await axios.post(NOTIFICATION_SERVICE, {
                to: adminEmail,
                subject: `Payment Received: Invoice #${invoice._id.toString().slice(-6).toUpperCase()}`,
                message: emailContent
             });
             console.log(`[Invoice Service] Payment notification sent to Admin (${adminEmail})`);

        } catch (payNotifyErr) {
            console.error("[Invoice Service] Failed to notify admin of payment:", payNotifyErr.message);
        }
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
        const NOTIFICATION_SERVICE = 'http://notification-service:5005/api/notifications/email'; // Direct Service URL
        
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
