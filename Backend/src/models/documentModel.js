const mongoose = require('mongoose');

/**
 * Document Metadata Schema
 * Stores metadata about uploaded documents in MongoDB
 * Actual files are stored in GridFS (uploads.files + uploads.chunks)
 */
const documentSchema = new mongoose.Schema({
    applicationId: {
        type: Number,
        required: true,
        index: true
    },
    applicantId: {
        type: Number,
        required: true,
        index: true
    },
    documentType: {
        type: String,
        required: true,
        enum: ['photo', 'tenth_marksheet', 'twelfth_marksheet', 'aadhaar_card']
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    gridfsFileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for quick lookup
documentSchema.index({ applicationId: 1, documentType: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
