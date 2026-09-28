import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/common/Button/Button';
import styles from './Home.module.css';

export default function Home() {
    const { isAuthenticated, isAdmin, isApplicant } = useAuth();

    return (
        <div className="page-container">
            <section className={styles.hero}>
                <span className={styles.badge}>Admissions 2026-27</span>
                <h1 className={styles.title}>
                    Welcome to <span className={styles.titleAccent}>IEM</span> Admission Portal
                </h1>
                <p className={styles.subtitle}>
                    Apply for admission to the Institute of Engineering & Management.
                    Complete your application online with our streamlined process.
                </p>
                <div className={styles.actions}>
                    {!isAuthenticated && (
                        <>
                            <Link to="/register">
                                <Button variant="primary" size="lg">Apply Now</Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="secondary" size="lg">Applicant Login</Button>
                            </Link>
                        </>
                    )}
                    {isApplicant && (
                        <Link to="/applicant/dashboard">
                            <Button variant="primary" size="lg">Go to Dashboard</Button>
                        </Link>
                    )}
                    {isAdmin && (
                        <Link to="/admin/dashboard">
                            <Button variant="primary" size="lg">Admin Dashboard</Button>
                        </Link>
                    )}
                </div>
            </section>

            <section className={styles.steps}>
                <div className={styles.step}>
                    <span className={styles.stepNumber}>1</span>
                    <h3 className={styles.stepTitle}>Register</h3>
                    <p className={styles.stepDesc}>Create your account with basic information</p>
                </div>
                <div className={styles.step}>
                    <span className={styles.stepNumber}>2</span>
                    <h3 className={styles.stepTitle}>Fill Application</h3>
                    <p className={styles.stepDesc}>Complete the admission form with your details</p>
                </div>
                <div className={styles.step}>
                    <span className={styles.stepNumber}>3</span>
                    <h3 className={styles.stepTitle}>Upload Documents</h3>
                    <p className={styles.stepDesc}>Submit required documents for verification</p>
                </div>
                <div className={styles.step}>
                    <span className={styles.stepNumber}>4</span>
                    <h3 className={styles.stepTitle}>Track Status</h3>
                    <p className={styles.stepDesc}>Monitor your application status in real-time</p>
                </div>
            </section>
        </div>
    );
}
