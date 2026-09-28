const mysql = require('mysql2/promise');

let pool;

/**
 * Initialize MySQL connection pool
 */
const connectMySQL = async () => {
    try {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test the connection
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();

        return pool;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        process.exit(1);
    }
};

/**
 * Get the MySQL connection pool
 */
const getPool = () => {
    if (!pool) {
        throw new Error('MySQL pool not initialized. Call connectMySQL() first.');
    }
    return pool;
};

module.exports = { connectMySQL, getPool };
