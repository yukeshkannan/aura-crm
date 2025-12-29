const { mongoose } = require('../../../packages/database');

const invoiceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
    // ref: 'Contact'
  },
  customerName: {
      type: String,
      required: true
  },
  customerEmail: {
      type: String,
      required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId
      // ref: 'Product'
    },
    description: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue'],
    default: 'Draft'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
