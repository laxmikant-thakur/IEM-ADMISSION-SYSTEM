/**
 * Validation utility functions
 */

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone) => {
    // Indian phone number: 10 digits, optionally prefixed with +91
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

const isValidAadhaar = (aadhaar) => {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar);
};

const isValidPincode = (pincode) => {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
};

const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
};

const isValidPercentage = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
};

const isValidYear = (year) => {
    const num = parseInt(year, 10);
    return !isNaN(num) && num >= 1990 && num <= new Date().getFullYear();
};

/**
 * Validate registration data
 * Returns object with field-level errors, or null if valid
 */
const validateRegistration = (data) => {
    const errors = {};

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.email = 'Valid email is required';
    }

    if (!data.password || data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (!data.phone || !isValidPhone(data.phone)) {
        errors.phone = 'Valid 10-digit phone number is required';
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validate application form data
 * Returns object with field-level errors, or null if valid
 */
const validateApplication = (data) => {
    const errors = {};

    // Personal Information
    if (!data.date_of_birth || !isValidDate(data.date_of_birth)) {
        errors.date_of_birth = 'Valid date of birth is required';
    }

    if (!data.gender || !['Male', 'Female', 'Other'].includes(data.gender)) {
        errors.gender = 'Gender must be Male, Female, or Other';
    }

    if (!data.nationality || data.nationality.trim().length < 2) {
        errors.nationality = 'Nationality is required';
    }

    if (!data.category || !['General', 'OBC', 'SC', 'ST'].includes(data.category)) {
        errors.category = 'Category must be General, OBC, SC, or ST';
    }

    if (!data.aadhaar_number || !isValidAadhaar(data.aadhaar_number)) {
        errors.aadhaar_number = 'Valid 12-digit Aadhaar number is required';
    }

    // Guardian
    if (!data.guardian_name || data.guardian_name.trim().length < 2) {
        errors.guardian_name = 'Guardian name is required';
    }

    // Address
    if (!data.address_line1 || data.address_line1.trim().length < 5) {
        errors.address_line1 = 'Address is required';
    }

    if (!data.city || data.city.trim().length < 2) {
        errors.city = 'City is required';
    }

    if (!data.state || data.state.trim().length < 2) {
        errors.state = 'State is required';
    }

    if (!data.pincode || !isValidPincode(data.pincode)) {
        errors.pincode = 'Valid 6-digit pincode is required';
    }

    // Academic: 10th
    if (!data.tenth_board || data.tenth_board.trim().length < 2) {
        errors.tenth_board = '10th board name is required';
    }

    if (!data.tenth_year || !isValidYear(data.tenth_year)) {
        errors.tenth_year = 'Valid 10th passing year is required';
    }

    if (!data.tenth_percentage || !isValidPercentage(data.tenth_percentage)) {
        errors.tenth_percentage = 'Valid 10th percentage (0-100) is required';
    }

    // Academic: 12th
    if (!data.twelfth_board || data.twelfth_board.trim().length < 2) {
        errors.twelfth_board = '12th board name is required';
    }

    if (!data.twelfth_year || !isValidYear(data.twelfth_year)) {
        errors.twelfth_year = 'Valid 12th passing year is required';
    }

    if (!data.twelfth_percentage || !isValidPercentage(data.twelfth_percentage)) {
        errors.twelfth_percentage = 'Valid 12th percentage (0-100) is required';
    }

    // Department
    if (!data.department_id) {
        errors.department_id = 'Department selection is required';
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidAadhaar,
    isValidPincode,
    isValidDate,
    isValidPercentage,
    isValidYear,
    validateRegistration,
    validateApplication
};
