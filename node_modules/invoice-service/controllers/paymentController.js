const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Public
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ date: -1 }).populate('invoiceId', 'totalAmount status');
        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (err) {
        console.error("Error fetching payments:", err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create a payment
// @route   POST /api/payments
// @access  Public
exports.createPayment = async (req, res) => {
    try {
        const { invoiceId, amount } = req.body;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

        const payment = await Payment.create({
            ...req.body,
            customerName: invoice.customerName,
            customerId: invoice.customerId
        });

        // Update Invoice Status logic
        // Calculate total paid so far
        const allPayments = await Payment.find({ invoiceId });
        const totalPaid = allPayments.reduce((acc, curr) => acc + curr.amount, 0);

        if (totalPaid >= invoice.totalAmount) {
            invoice.status = 'Paid';
        } else {
            invoice.status = 'Partial';
        }
        await invoice.save();

        res.status(201).json({ success: true, data: payment, invoiceStatus: invoice.status });

    } catch (err) {
        console.error("Error creating payment:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private (Admin)
exports.deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        await payment.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error('Error deleting payment:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
