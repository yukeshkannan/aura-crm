const express = require('express');
const { sendNotification } = require('../controllers/notificationController');

const router = express.Router();

router.post('/email', sendNotification);

module.exports = router;
