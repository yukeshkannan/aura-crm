const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoiceEmail
} = require('../controllers/invoiceController');

router
  .route('/')
  .get(getInvoices)
  .post(createInvoice);

router
  .route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.route('/:id/send').post(sendInvoiceEmail);

module.exports = router;
