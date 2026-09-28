import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import { validateRegistration } from '../../../utils/validation';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import Alert from '../../../components/common/Alert/Alert';
import styles from '../Login/Login.module.css';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: ''
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setSuccess('');

        // Client-side validation
        const validationErrors = validateRegistration(formData);
        if (validationErrors) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await authService.register(formData);
            if (res.success) {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                setErrors(data.errors);
            }
            setServerError(data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Register for IEM admission portal</p>
                </div>

                <Card>
                    {serverError && <Alert type="error" onClose={() => setServerError('')}>{serverError}</Alert>}
                    {success && <Alert type="success">{success}</Alert>}
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <Input
                            label="Full Name" name="name" value={formData.name}
                            onChange={handleChange} error={errors.name}
                            placeholder="Enter your full name" required
                        />
                        <Input
                            label="Email Address" name="email" type="email" value={formData.email}
                            onChange={handleChange} error={errors.email}
                            placeholder="Enter your email" required
                        />
                        <Input
                            label="Password" name="password" type="password" value={formData.password}
                            onChange={handleChange} error={errors.password}
                            placeholder="At least 6 characters" required
                        />
                        <Input
                            label="Phone Number" name="phone" value={formData.phone}
                            onChange={handleChange} error={errors.phone}
                            placeholder="10-digit phone number" required
                        />
                        <Button type="submit" fullWidth loading={loading}>
                            Register
                        </Button>
                    </form>
                </Card>

                <div className={styles.footer}>
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}
