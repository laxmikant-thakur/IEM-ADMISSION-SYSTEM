import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import applicationService from '../../../services/applicationService';
import { validateApplication } from '../../../utils/validation';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import FileUpload from '../../../components/common/FileUpload/FileUpload';
import Button from '../../../components/common/Button/Button';
import Alert from '../../../components/common/Alert/Alert';
import Loader from '../../../components/common/Loader/Loader';
import styles from './Application.module.css';

const initialFormData = {
    date_of_birth: '', gender: '', blood_group: '', nationality: 'Indian',
    category: '', aadhaar_number: '', guardian_name: '',
    address_line1: '', address_line2: '', city: '', state: '', pincode: '',
    tenth_board: '', tenth_year: '', tenth_percentage: '',
    twelfth_board: '', twelfth_year: '', twelfth_percentage: '',
    department_id: ''
};

export default function Application() {
    const [formData, setFormData] = useState(initialFormData);
    const [files, setFiles] = useState({ photo: null, tenth_marksheet: null, twelfth_marksheet: null, aadhaar_card: null });
    const [departments, setDepartments] = useState([]);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [hasExisting, setHasExisting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Check if already has application
            const appRes = await applicationService.getMyApplication();
            if (appRes.success && appRes.data.application) {
                setHasExisting(true);
                setPageLoading(false);
                return;
            }
        } catch { /* no existing application */ }

        try {
            const deptRes = await applicationService.getDepartments();
            if (deptRes.success) {
                setDepartments(deptRes.data.departments.map(d => ({
                    value: d.id, label: d.name
                })));
            }
        } catch { /* ignore */ }

        setPageLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setServerError('');
    };

    const handleFileChange = (name, file) => {
        setFiles({ ...files, [name]: file });
        setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setSuccess('');

        // Client-side validation
        const validationErrors = validateApplication(formData);
        const fileErrors = {};
        if (!files.photo) fileErrors.photo = 'Photo is required';
        if (!files.tenth_marksheet) fileErrors.tenth_marksheet = '10th marksheet is required';
        if (!files.twelfth_marksheet) fileErrors.twelfth_marksheet = '12th marksheet is required';
        if (!files.aadhaar_card) fileErrors.aadhaar_card = 'Aadhaar card is required';

        const allErrors = { ...(validationErrors || {}), ...fileErrors };
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            return;
        }

        // Build FormData for multipart
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            fd.append(key, value);
        });
        Object.entries(files).forEach(([key, file]) => {
            if (file) fd.append(key, file);
        });

        setLoading(true);
        try {
            const res = await applicationService.submitApplication(fd);
            if (res.success) {
                setSuccess('Application submitted successfully!');
                setTimeout(() => navigate('/applicant/dashboard'), 2000);
            }
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                setErrors(data.errors);
            }
            setServerError(data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <Loader fullPage />;

    if (hasExisting) {
        return (
            <div>
                <Card>
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <h2>Application Already Submitted</h2>
                        <p style={{ color: 'var(--gray-500)', margin: 'var(--space-4) 0' }}>
                            You have already submitted an application. You cannot submit another one.
                        </p>
                        <Button onClick={() => navigate('/applicant/dashboard')}>Go to Dashboard</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.formPage}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admission Application</h1>
                <p className={styles.subtitle}>Fill in all required fields and upload necessary documents</p>
            </div>

            <div className={styles.alertContainer}>
                {serverError && <Alert type="error" onClose={() => setServerError('')}>{serverError}</Alert>}
                {success && <Alert type="success">{success}</Alert>}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <Card title="1. Personal Information" className={styles.section}>
                    <div className={styles.grid}>
                        <Input label="Date of Birth" name="date_of_birth" type="date"
                            value={formData.date_of_birth} onChange={handleChange}
                            error={errors.date_of_birth} required />
                        <Select label="Gender" name="gender" value={formData.gender}
                            onChange={handleChange} error={errors.gender} required
                            options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' }
                            ]} />
                        <Input label="Blood Group" name="blood_group"
                            value={formData.blood_group} onChange={handleChange}
                            placeholder="e.g., A+, B-, O+" />
                        <Input label="Nationality" name="nationality"
                            value={formData.nationality} onChange={handleChange}
                            error={errors.nationality} required />
                        <Select label="Category" name="category" value={formData.category}
                            onChange={handleChange} error={errors.category} required
                            options={[
                                { value: 'General', label: 'General' },
                                { value: 'OBC', label: 'OBC' },
                                { value: 'SC', label: 'SC' },
                                { value: 'ST', label: 'ST' }
                            ]} />
                        <Input label="Aadhaar Number" name="aadhaar_number"
                            value={formData.aadhaar_number} onChange={handleChange}
                            error={errors.aadhaar_number} placeholder="12-digit Aadhaar number" required />
                    </div>
                </Card>

                {/* Guardian Information */}
                <Card title="2. Guardian Information" className={styles.section}>
                    <div className={styles.grid}>
                        <Input label="Guardian Name" name="guardian_name"
                            value={formData.guardian_name} onChange={handleChange}
                            error={errors.guardian_name} placeholder="Parent/Guardian full name" required />
                    </div>
                </Card>

                {/* Address */}
                <Card title="3. Address" className={styles.section}>
                    <div className={styles.grid}>
                        <div className={styles.gridFull}>
                            <Input label="Address Line 1" name="address_line1"
                                value={formData.address_line1} onChange={handleChange}
                                error={errors.address_line1} placeholder="Street address" required />
                        </div>
                        <div className={styles.gridFull}>
                            <Input label="Address Line 2" name="address_line2"
                                value={formData.address_line2} onChange={handleChange}
                                placeholder="Apartment, suite, etc. (optional)" />
                        </div>
                        <Input label="City" name="city" value={formData.city}
                            onChange={handleChange} error={errors.city} required />
                        <Input label="State" name="state" value={formData.state}
                            onChange={handleChange} error={errors.state} required />
                        <Input label="Pincode" name="pincode" value={formData.pincode}
                            onChange={handleChange} error={errors.pincode}
                            placeholder="6-digit pincode" required />
                    </div>
                </Card>

                {/* Academic: 10th */}
                <Card title="4. Academic Information — Class 10th" className={styles.section}>
                    <div className={styles.grid}>
                        <Input label="Board" name="tenth_board" value={formData.tenth_board}
                            onChange={handleChange} error={errors.tenth_board}
                            placeholder="e.g., CBSE, ICSE, State Board" required />
                        <Input label="Year of Passing" name="tenth_year" type="number"
                            value={formData.tenth_year} onChange={handleChange}
                            error={errors.tenth_year} placeholder="e.g., 2022" required />
                        <Input label="Percentage" name="tenth_percentage" type="number"
                            value={formData.tenth_percentage} onChange={handleChange}
                            error={errors.tenth_percentage} placeholder="e.g., 85.50" required
                            step="0.01" min="0" max="100" />
                    </div>
                </Card>

                {/* Academic: 12th */}
                <Card title="5. Academic Information — Class 12th" className={styles.section}>
                    <div className={styles.grid}>
                        <Input label="Board" name="twelfth_board" value={formData.twelfth_board}
                            onChange={handleChange} error={errors.twelfth_board}
                            placeholder="e.g., CBSE, ICSE, State Board" required />
                        <Input label="Year of Passing" name="twelfth_year" type="number"
                            value={formData.twelfth_year} onChange={handleChange}
                            error={errors.twelfth_year} placeholder="e.g., 2024" required />
                        <Input label="Percentage" name="twelfth_percentage" type="number"
                            value={formData.twelfth_percentage} onChange={handleChange}
                            error={errors.twelfth_percentage} placeholder="e.g., 90.25" required
                            step="0.01" min="0" max="100" />
                    </div>
                </Card>

                {/* Department */}
                <Card title="6. Department Selection" className={styles.section}>
                    <div className={styles.grid}>
                        <Select label="Preferred Department" name="department_id"
                            value={formData.department_id} onChange={handleChange}
                            error={errors.department_id} required options={departments}
                            placeholder="Choose your department" />
                    </div>
                </Card>

                {/* Documents */}
                <Card title="7. Document Upload" className={styles.section}>
                    <div className={styles.documentsGrid}>
                        <FileUpload label="Passport Photo" name="photo"
                            accept="image/jpeg,image/png" file={files.photo}
                            onChange={handleFileChange} error={errors.photo} required />
                        <FileUpload label="10th Marksheet" name="tenth_marksheet"
                            accept="image/*,application/pdf" file={files.tenth_marksheet}
                            onChange={handleFileChange} error={errors.tenth_marksheet} required />
                        <FileUpload label="12th Marksheet" name="twelfth_marksheet"
                            accept="image/*,application/pdf" file={files.twelfth_marksheet}
                            onChange={handleFileChange} error={errors.twelfth_marksheet} required />
                        <FileUpload label="Aadhaar Card" name="aadhaar_card"
                            accept="image/*,application/pdf" file={files.aadhaar_card}
                            onChange={handleFileChange} error={errors.aadhaar_card} required />
                    </div>
                </Card>

                <div className={styles.submitSection}>
                    <Button variant="secondary" onClick={() => navigate('/applicant/dashboard')}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="lg" loading={loading}>
                        Submit Application
                    </Button>
                </div>
            </form>
        </div>
    );
}
