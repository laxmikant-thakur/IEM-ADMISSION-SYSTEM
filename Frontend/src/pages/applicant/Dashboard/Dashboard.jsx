import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import applicationService from '../../../services/applicationService';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import Button from '../../../components/common/Button/Button';
import Loader from '../../../components/common/Loader/Loader';
import Alert from '../../../components/common/Alert/Alert';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const { user } = useAuth();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasApplication, setHasApplication] = useState(false);

    useEffect(() => {
        fetchApplication();
    }, []);

    const fetchApplication = async () => {
        try {
            const res = await applicationService.getMyApplication();
            if (res.success && res.data.application) {
                setApplication(res.data.application);
                setHasApplication(true);
            }
        } catch {
            // No application yet
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader fullPage />;

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h1 className={styles.welcomeTitle}>Welcome back, {user?.name}</h1>
                <p className={styles.welcomeSubtitle}>Application for Admission 2026-27</p>
            </div>

            {!hasApplication ? (
                <Card>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📝</div>
                        <h2 className={styles.emptyTitle}>No Application Yet</h2>
                        <p className={styles.emptyDesc}>
                            You haven't submitted an application. Start your admission application now.
                        </p>
                        <Link to="/applicant/application">
                            <Button variant="primary" size="lg">Start Application</Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <>
                    <Card title="Application Status" className={styles.statusCard}>
                        <div className={styles.statusInfo}>
                            <div>
                                <span className={styles.statusLabel}>Current Status: </span>
                                <Badge status={application.status} />
                            </div>
                            <span className={styles.applicationId}>
                                ID: IEM-2026-{String(application.id).padStart(5, '0')}
                            </span>
                        </div>

                        {application.status === 'Rejected' && application.rejection_reason && (
                            <div className={styles.rejectionBox}>
                                <p className={styles.rejectionLabel}>Rejection Reason:</p>
                                <p className={styles.rejectionText}>{application.rejection_reason}</p>
                            </div>
                        )}

                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}>Department</div>
                                <div className={styles.infoValue}>{application.department_name}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}>Submitted</div>
                                <div className={styles.infoValue}>
                                    {new Date(application.submitted_at).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}>Category</div>
                                <div className={styles.infoValue}>{application.category}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}>12th Percentage</div>
                                <div className={styles.infoValue}>{application.twelfth_percentage}%</div>
                            </div>
                        </div>
                    </Card>

                    <div className={styles.actions}>
                        <Link to="/applicant/status">
                            <Button variant="primary">Check Status</Button>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
