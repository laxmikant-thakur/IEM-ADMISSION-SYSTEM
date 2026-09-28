const { validateApplication } = require('../../utils/validation');

describe('Application Validation', () => {
    let validData;

    beforeEach(() => {
        validData = {
            date_of_birth: '2005-01-01',
            gender: 'Male',
            nationality: 'Indian',
            category: 'General',
            aadhaar_number: '123456789012',
            guardian_name: 'John Doe',
            address_line1: '123 Main St',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700001',
            tenth_board: 'CBSE',
            tenth_year: '2021',
            tenth_percentage: '85.5',
            twelfth_board: 'CBSE',
            twelfth_year: '2023',
            twelfth_percentage: '90.2',
            department_id: '1'
        };
    });

    test('should pass validation with valid data', () => {
        const errors = validateApplication(validData);
        expect(errors).toBeNull();
    });

    test('should require valid date_of_birth', () => {
        delete validData.date_of_birth;
        const errors = validateApplication(validData);
        expect(errors).not.toBeNull();
        expect(errors.date_of_birth).toBe('Valid date of birth is required');
    });

    test('should validate gender', () => {
        validData.gender = 'Alien';
        const errors = validateApplication(validData);
        expect(errors).not.toBeNull();
        expect(errors.gender).toBe('Gender must be Male, Female, or Other');
    });

    test('should validate category', () => {
        validData.category = 'XYZ';
        const errors = validateApplication(validData);
        expect(errors).not.toBeNull();
        expect(errors.category).toBe('Category must be General, OBC, SC, or ST');
    });

    test('should require exactly 12 digits for Aadhaar', () => {
        validData.aadhaar_number = '123';
        const errors = validateApplication(validData);
        expect(errors).not.toBeNull();
        expect(errors.aadhaar_number).toBe('Valid 12-digit Aadhaar number is required');

        validData.aadhaar_number = '1234567890123'; // 13 digits
        const errors2 = validateApplication(validData);
        expect(errors2).not.toBeNull();
        expect(errors2.aadhaar_number).toBe('Valid 12-digit Aadhaar number is required');
    });

    test('should require 6 digits for pincode', () => {
        validData.pincode = '700';
        const errors = validateApplication(validData);
        expect(errors).not.toBeNull();
        expect(errors.pincode).toBe('Valid 6-digit pincode is required');
    });

    test('should validate academic percentages', () => {
        validData.tenth_percentage = '105';
        const errors = validateApplication(validData);
        expect(errors).not.toBeNull();
        expect(errors.tenth_percentage).toBe('Valid 10th percentage (0-100) is required');

        validData.tenth_percentage = '85.5';
        validData.twelfth_percentage = '105';
        const errors2 = validateApplication(validData);
        expect(errors2).not.toBeNull();
        expect(errors2.twelfth_percentage).toBe('Valid 12th percentage (0-100) is required');
    });
});
