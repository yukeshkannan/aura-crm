const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendance } = require('../controllers/attendanceController');

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/', getAttendance);
router.delete('/:id', require('../controllers/attendanceController').deleteAttendance);

module.exports = router;
