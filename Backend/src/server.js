require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

// Config
const { connectMySQL } = require('./config/mysql');
const { connectMongoDB } = require('./config/mongodb');

// Routes
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Initialize database connections and start the server
 */
const startServer = async () => {
    try {
        // 1. Connect to databases
        await connectMySQL();
        await connectMongoDB();

        // 2. Configure CORS
        app.use(cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // 3. Parse JSON and URL-encoded bodies
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // 4. Configure session handling
        app.use(session({
            secret: process.env.SESSION_SECRET || 'fallback_secret_change_this',
            resave: false,
            saveUninitialized: false,
            store: new MongoStore({
                mongoUrl: process.env.MONGO_URI,
                collectionName: 'sessions',
                ttl: 24 * 60 * 60 // 24 hours
            }),
            cookie: {
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                httpOnly: true,
                secure: false, // Set to true in production with HTTPS
                sameSite: 'lax'
            }
        }));

        // 5. Health check
        app.get('/api/health', (req, res) => {
            res.json({
                success: true,
                message: 'IEM Admission System API is running',
                timestamp: new Date().toISOString()
            });
        });

        // 6. Register routes
        app.use('/api/auth', authRoutes);
        app.use('/api/applications', applicationRoutes);
        app.use('/api/admin', adminRoutes);
        app.use('/api/departments', departmentRoutes);

        // 7. Error handling
        app.use(notFoundHandler);
        app.use(errorHandler);

        // 8. Start the server
        app.listen(PORT, () => {
            console.log(`\n🚀 IEM Admission System Backend`);
            console.log(`   Server running on http://localhost:${PORT}`);
            console.log(`   Health check: http://localhost:${PORT}/api/health`);
            console.log(`   CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}\n`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
