const multer = require('multer');
const path = require('path');

/**
 * Allowed MIME types for each document type
 */
const ALLOWED_TYPES = {
    photo: ['image/jpeg', 'image/png', 'image/jpg'],
    tenth_marksheet: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    twelfth_marksheet: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    aadhaar_card: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
};

/**
 * Max file sizes
 */
const MAX_SIZES = {
    photo: 2 * 1024 * 1024,            // 2MB
    tenth_marksheet: 5 * 1024 * 1024,   // 5MB
    twelfth_marksheet: 5 * 1024 * 1024, // 5MB
    aadhaar_card: 5 * 1024 * 1024       // 5MB
};

/**
 * Configure multer with memory storage
 * Files are stored in memory buffer then uploaded to GridFS
 */
const storage = multer.memoryStorage();

/**
 * File filter to validate MIME types
 */
const fileFilter = (req, file, cb) => {
    const fieldAllowed = ALLOWED_TYPES[file.fieldname];
    if (fieldAllowed && fieldAllowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${(fieldAllowed || []).join(', ')}`), false);
    }
};

/**
 * Multer upload configuration for application documents
 */
const uploadDocuments = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Overall max 5MB per file
        files: 4                    // Max 4 files
    }
}).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'tenth_marksheet', maxCount: 1 },
    { name: 'twelfth_marksheet', maxCount: 1 },
    { name: 'aadhaar_card', maxCount: 1 }
]);

/**
 * Middleware wrapper for multer that handles errors gracefully
 */
const handleUpload = (req, res, next) => {
    uploadDocuments(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large',
                    errors: { [err.field]: `File exceeds maximum size limit` }
                });
            }
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                errors: { upload: err.message }
            });
        }
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                errors: { upload: err.message }
            });
        }
        next();
    });
};

module.exports = { handleUpload, ALLOWED_TYPES, MAX_SIZES };
