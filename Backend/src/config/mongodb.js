const mongoose = require('mongoose');

let gridFSBucket;

/**
 * Connect to MongoDB using Mongoose
 */
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');

        const db = mongoose.connection.db;

        // Initialize GridFS bucket for file storage
        gridFSBucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'uploads'
        });

        console.log('✅ GridFS bucket initialized');

        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

/**
 * Get GridFS bucket instance
 */
const getGridFSBucket = () => {
    if (!gridFSBucket) {
        throw new Error('GridFS bucket not initialized. Call connectMongoDB() first.');
    }
    return gridFSBucket;
};

module.exports = { connectMongoDB, getGridFSBucket };
