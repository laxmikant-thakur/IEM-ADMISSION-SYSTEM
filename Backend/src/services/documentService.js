const { Readable } = require('stream');
const Document = require('../models/documentModel');
const { getGridFSBucket } = require('../config/mongodb');

/**
 * Document Service — handles document upload and retrieval via GridFS
 */
const DocumentService = {
    /**
     * Upload a file to GridFS and create metadata record
     * @param {Object} file - Multer file object (from memory storage)
     * @param {string} documentType - Type of document (photo, tenth_marksheet, etc.)
     * @param {number} applicationId - MySQL application ID
     * @param {number} applicantId - MySQL applicant ID
     */
    uploadDocument: async (file, documentType, applicationId, applicantId) => {
        const bucket = getGridFSBucket();

        // Create readable stream from buffer
        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        // Upload to GridFS
        const uploadStream = bucket.openUploadStream(file.originalname, {
            contentType: file.mimetype,
            metadata: {
                applicationId,
                applicantId,
                documentType
            }
        });

        return new Promise((resolve, reject) => {
            readableStream.pipe(uploadStream)
                .on('error', reject)
                .on('finish', async () => {
                    try {
                        // Create metadata document in MongoDB
                        const doc = await Document.create({
                            applicationId,
                            applicantId,
                            documentType,
                            originalName: file.originalname,
                            mimeType: file.mimetype,
                            size: file.size,
                            gridfsFileId: uploadStream.id
                        });

                        resolve(doc);
                    } catch (err) {
                        reject(err);
                    }
                });
        });
    },

    /**
     * Upload multiple documents for an application
     * @param {Object} files - Multer files object { fieldname: [file] }
     * @param {number} applicationId - MySQL application ID
     * @param {number} applicantId - MySQL applicant ID
     */
    uploadMultipleDocuments: async (files, applicationId, applicantId) => {
        const uploadedDocs = [];

        const documentTypes = ['photo', 'tenth_marksheet', 'twelfth_marksheet', 'aadhaar_card'];

        for (const docType of documentTypes) {
            if (files[docType] && files[docType][0]) {
                const doc = await DocumentService.uploadDocument(
                    files[docType][0],
                    docType,
                    applicationId,
                    applicantId
                );
                uploadedDocs.push(doc);
            }
        }

        return uploadedDocs;
    },

    /**
     * Get all documents for an application
     */
    getDocumentsByApplicationId: async (applicationId) => {
        return await Document.find({ applicationId }).lean();
    },

    /**
     * Get a specific document's metadata
     */
    getDocumentById: async (documentId) => {
        return await Document.findById(documentId).lean();
    },

    /**
     * Get a file stream from GridFS for downloading
     */
    getFileStream: (gridfsFileId) => {
        const bucket = getGridFSBucket();
        return bucket.openDownloadStream(gridfsFileId);
    }
};

module.exports = DocumentService;
