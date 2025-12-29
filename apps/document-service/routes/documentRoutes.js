const express = require('express');
const { uploadFile, getFile } = require('../controllers/documentController');
const upload = require('../middleware/upload');

const router = express.Router();

// Upload Route (Single file, field name 'file')
router.post('/upload', upload.single('file'), uploadFile);

// Get File Route
router.get('/:filename', getFile);

module.exports = router;
