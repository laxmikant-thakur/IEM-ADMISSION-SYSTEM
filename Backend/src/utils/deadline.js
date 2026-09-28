const { getPool } = require('../config/mysql');

/**
 * Get the current application deadline
 * Checks admin-set deadline first, falls back to .env
 */
const getDeadline = async () => {
    const pool = getPool();
    const [rows] = await pool.query(
        "SELECT value FROM settings WHERE `key` = 'application_deadline'"
    );

    if (rows.length > 0) {
        return new Date(rows[0].value);
    }

    return new Date(process.env.APPLICATION_DEADLINE);
};

/**
 * Check if the application deadline has passed
 */
const isDeadlinePassed = async () => {
    const deadline = await getDeadline();
    return new Date() > deadline;
};

/**
 * Update the application deadline (admin action)
 */
const updateDeadline = async (newDeadline) => {
    const pool = getPool();
    await pool.query(
        "INSERT INTO settings (`key`, value) VALUES ('application_deadline', ?) ON DUPLICATE KEY UPDATE value = ?",
        [newDeadline, newDeadline]
    );
};

/**
 * Transition submitted applications to "Under Review" if deadline has passed
 * Called lazily on relevant API endpoints
 */
const transitionSubmittedApplications = async () => {
    const passed = await isDeadlinePassed();
    if (!passed) return 0;

    const pool = getPool();
    const [result] = await pool.query(
        "UPDATE applications SET status = 'Under Review' WHERE status = 'Submitted'"
    );

    return result.affectedRows;
};

module.exports = {
    getDeadline,
    isDeadlinePassed,
    updateDeadline,
    transitionSubmittedApplications
};
