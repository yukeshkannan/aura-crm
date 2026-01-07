const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

// S3 Client Configuration
// S3 Client Configuration
let s3;
try {
    s3 = new S3Client({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });
} catch (err) {
    console.warn('Failed to initialize S3 Client:', err.message);
}

// 1. Local Storage Configuration
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. S3 Storage Configuration
let s3Storage;
if (s3) {
    try {
        s3Storage = multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET_NAME || 'company-crm-uploads',
            metadata: (req, file, cb) => {
                cb(null, { fieldName: file.fieldname });
            },
            key: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `documents/${Date.now()}-${file.originalname}`);
            }
        });
    } catch (err) {
        console.warn('Failed to configure S3 Storage:', err.message);
    }
}

// Select Storage based on .env and availability
const selectedStorage = (process.env.STORAGE_TYPE === 's3' && s3Storage) ? s3Storage : diskStorage;

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only Images and PDFs are allowed!'), false);
    }
};

const upload = multer({ 
    storage: selectedStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
