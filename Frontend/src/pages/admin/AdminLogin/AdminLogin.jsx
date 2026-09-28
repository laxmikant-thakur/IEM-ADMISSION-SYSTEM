import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import authService from '../../../services/authService';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import Alert from '../../../components/common/Alert/Alert';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return;
        }

        setLoading(true);
        try {
            const res = await authService.adminLogin(formData);
            if (res.success) {
                login(res.data.user);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Admin login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Admin Login</h1>
                    <p className={styles.subtitle}>Access the administration dashboard</p>
                </div>

                <Card>
                    {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <Input
                            label="Admin Email" name="email" type="email"
                            value={formData.email} onChange={handleChange}
                            placeholder="admin@iem.edu.in" required
                        />
                        <Input
                            label="Password" name="password" type="password"
                            value={formData.password} onChange={handleChange}
                            placeholder="Enter admin password" required
                        />
                        <Button type="submit" fullWidth loading={loading}>
                            Admin Sign In
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
