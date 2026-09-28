export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidAadhaar = (aadhaar) => {
    return /^\d{12}$/.test(aadhaar);
};

export const isValidPincode = (pincode) => {
    return /^\d{6}$/.test(pincode);
};

export const isValidPercentage = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
};

export const isValidYear = (year) => {
    const num = parseInt(year, 10);
    return !isNaN(num) && num >= 1990 && num <= new Date().getFullYear();
};

export const validateRegistration = (data) => {
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

export const validateApplication = (data) => {
    const errors = {};

    if (!data.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    if (!data.gender) errors.gender = 'Gender is required';
    if (!data.nationality || data.nationality.trim().length < 2) errors.nationality = 'Nationality is required';
    if (!data.category) errors.category = 'Category is required';
    if (!data.aadhaar_number || !isValidAadhaar(data.aadhaar_number)) errors.aadhaar_number = 'Valid 12-digit Aadhaar number is required';
    if (!data.guardian_name || data.guardian_name.trim().length < 2) errors.guardian_name = 'Guardian name is required';
    if (!data.address_line1 || data.address_line1.trim().length < 5) errors.address_line1 = 'Address is required';
    if (!data.city || data.city.trim().length < 2) errors.city = 'City is required';
    if (!data.state || data.state.trim().length < 2) errors.state = 'State is required';
    if (!data.pincode || !isValidPincode(data.pincode)) errors.pincode = 'Valid 6-digit pincode is required';
    if (!data.tenth_board || data.tenth_board.trim().length < 2) errors.tenth_board = '10th board is required';
    if (!data.tenth_year || !isValidYear(data.tenth_year)) errors.tenth_year = 'Valid 10th year is required';
    if (!data.tenth_percentage || !isValidPercentage(data.tenth_percentage)) errors.tenth_percentage = 'Valid 10th percentage is required';
    if (!data.twelfth_board || data.twelfth_board.trim().length < 2) errors.twelfth_board = '12th board is required';
    if (!data.twelfth_year || !isValidYear(data.twelfth_year)) errors.twelfth_year = 'Valid 12th year is required';
    if (!data.twelfth_percentage || !isValidPercentage(data.twelfth_percentage)) errors.twelfth_percentage = 'Valid 12th percentage is required';
    if (!data.department_id) errors.department_id = 'Department selection is required';

    return Object.keys(errors).length > 0 ? errors : null;
};
