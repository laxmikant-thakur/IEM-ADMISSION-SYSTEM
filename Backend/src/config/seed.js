require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const bcrypt = require('bcryptjs');
const { connectMySQL } = require('./mysql');
const { connectMongoDB } = require('./mongodb');

/**
 * SQL statements for creating all required tables
 */
const createTablesSQL = [
    // Admins table
    `CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Applicants table
    `CREATE TABLE IF NOT EXISTS applicants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Departments table
    `CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        total_seats INT NOT NULL DEFAULT 6,
        available_seats INT NOT NULL DEFAULT 6
    )`,

    // Settings table (for admin-configurable values like deadline)
    `CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Applications table
    `CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        applicant_id INT NOT NULL UNIQUE,
        department_id INT NOT NULL,

        date_of_birth DATE NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        blood_group VARCHAR(5),
        nationality VARCHAR(50) NOT NULL,
        category ENUM('General', 'OBC', 'SC', 'ST') NOT NULL,
        aadhaar_number VARCHAR(12) NOT NULL,

        guardian_name VARCHAR(100) NOT NULL,

        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(10) NOT NULL,

        tenth_board VARCHAR(100) NOT NULL,
        tenth_year INT NOT NULL,
        tenth_percentage DECIMAL(5,2) NOT NULL,

        twelfth_board VARCHAR(100) NOT NULL,
        twelfth_year INT NOT NULL,
        twelfth_percentage DECIMAL(5,2) NOT NULL,

        status ENUM('Submitted', 'Under Review', 'Accepted', 'Rejected')
            NOT NULL DEFAULT 'Submitted',
        rejection_reason TEXT,

        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (applicant_id) REFERENCES applicants(id),
        FOREIGN KEY (department_id) REFERENCES departments(id)
    )`
];

/**
 * Seed departments
 */
const seedDepartments = async (pool) => {
    const departments = ['CSE', 'ECE', 'IT', 'EE', 'ME'];

    for (const dept of departments) {
        const [existing] = await pool.query(
            'SELECT id FROM departments WHERE name = ?',
            [dept]
        );

        if (existing.length === 0) {
            await pool.query(
                'INSERT INTO departments (name, total_seats, available_seats) VALUES (?, 6, 6)',
                [dept]
            );
            console.log(`  ✅ Department "${dept}" created with 6 seats`);
        } else {
            console.log(`  ⏩ Department "${dept}" already exists`);
        }
    }
};

/**
 * Collect admin accounts from environment variables.
 * Reads ADMIN_N_EMAIL, ADMIN_N_PASSWORD, ADMIN_N_NAME where N = 1, 2, 3, ...
 * Stops when ADMIN_N_EMAIL is not found.
 */
const getAdminAccountsFromEnv = () => {
    const admins = [];
    let i = 1;

    while (true) {
        const email = process.env[`ADMIN_${i}_EMAIL`];
        const password = process.env[`ADMIN_${i}_PASSWORD`];
        const name = process.env[`ADMIN_${i}_NAME`] || `Admin ${i}`;

        if (!email || !password) break;

        admins.push({ email: email.trim().toLowerCase(), password: password.trim(), name: name.trim() });
        i++;
    }

    return admins;
};

/**
 * Seed admin accounts from environment variables
 */
const seedAdmins = async (pool) => {
    const admins = getAdminAccountsFromEnv();

    if (admins.length === 0) {
        console.log('  ⚠️  No admin accounts found in environment variables');
        console.log('     Add ADMIN_1_EMAIL, ADMIN_1_PASSWORD, ADMIN_1_NAME to .env');
        return;
    }

    for (const admin of admins) {
        const [existing] = await pool.query(
            'SELECT id FROM admins WHERE email = ?',
            [admin.email]
        );

        if (existing.length === 0) {
            const hashedPassword = await bcrypt.hash(admin.password, 12);
            await pool.query(
                'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
                [admin.name, admin.email, hashedPassword]
            );
            console.log(`  ✅ Admin "${admin.name}" created (${admin.email})`);
        } else {
            // Update password if it changed
            const hashedPassword = await bcrypt.hash(admin.password, 12);
            await pool.query(
                'UPDATE admins SET name = ?, password = ? WHERE email = ?',
                [admin.name, hashedPassword, admin.email]
            );
            console.log(`  🔄 Admin "${admin.name}" updated (${admin.email})`);
        }
    }

    console.log(`  📊 Total admin accounts: ${admins.length}`);
};

/**
 * Main seed function
 */
const seed = async () => {
    console.log('\n🌱 Starting database seed...\n');

    try {
        // Connect to databases
        const pool = await connectMySQL();
        await connectMongoDB();

        // Create tables
        console.log('📋 Creating tables...');
        for (const sql of createTablesSQL) {
            await pool.query(sql);
        }
        console.log('  ✅ All tables created\n');

        // Seed departments
        console.log('🏫 Seeding departments...');
        await seedDepartments(pool);
        console.log('');

        // Seed admins from env vars
        console.log('👤 Seeding admin accounts from environment...');
        await seedAdmins(pool);
        console.log('');

        console.log('✅ Database seed completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seed();
