const express = require('express');
const router = express.Router();
const { generatePayroll, getPayroll } = require('../controllers/payrollController');

router.post('/generate', generatePayroll);
router.get('/', getPayroll);
router.delete('/:id', require('../controllers/payrollController').deletePayroll);

module.exports = router;
