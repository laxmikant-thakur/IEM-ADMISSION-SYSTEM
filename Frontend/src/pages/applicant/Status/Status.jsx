import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import applicationService from '../../../services/applicationService';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import Button from '../../../components/common/Button/Button';
import Loader from '../../../components/common/Loader/Loader';
import styles from './Status.module.css';

const statusSteps = ['Submitted', 'Under Review', 'Decision'];

export default function Status() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchStatus(); }, []);

    const fetchStatus = async () => {
        try {
            const res = await applicationService.getMyStatus();
            if (res.success) setStatus(res.data.status);
        } catch { /* ignore */ }
        setLoading(false);
    };

    if (loading) return <Loader fullPage />;

    if (!status) {
        return (
            <div>
                <Card>
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <h2>No Application Found</h2>
                        <p style={{ color: 'var(--gray-500)', margin: '1rem 0' }}>Submit an application first to track its status.</p>
                        <Button onClick={() => navigate('/applicant/dashboard')}>Go to Dashboard</Button>
                    </div>
                </Card>
            </div>
        );
    }

    const getStepState = (step) => {
        const order = { 'Submitted': 0, 'Under Review': 1, 'Accepted': 2, 'Rejected': 2 };
        const current = order[status.status] ?? 0;
        const stepIndex = statusSteps.indexOf(step);
        if (step === 'Decision' && (status.status === 'Accepted' || status.status === 'Rejected')) {
            return status.status === 'Rejected' ? 'rejected' : 'completed';
        }
        if (stepIndex < current) return 'completed';
        if (stepIndex === current) return 'active';
        return '';
    };

    return (
        <div className={styles.statusPage}>
            <div className={styles.header}>
                <h1 className={styles.title}>Application Status</h1>
                <p className={styles.subtitle}>Track the progress of your admission application</p>
            </div>

            <Card title="Status Timeline">
                <div className={styles.timeline}>
                    {statusSteps.map((step, i) => (
                        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                            <div className={styles.timelineStep}>
                                <div className={`${styles.stepDot} ${styles[getStepState(step)]}`}>
                                    {getStepState(step) === 'completed' ? '✓' :
                                     getStepState(step) === 'rejected' ? '✗' : i + 1}
                                </div>
                                <span className={`${styles.stepLabel} ${getStepState(step) === 'active' ? styles.active : ''}`}>
                                    {step === 'Decision' ? (status.status === 'Accepted' ? 'Accepted' : status.status === 'Rejected' ? 'Rejected' : 'Decision') : step}
                                </span>
                            </div>
                            {i < statusSteps.length - 1 && (
                                <div className={`${styles.connector} ${getStepState(statusSteps[i + 1]) !== '' ? styles.active : ''}`} />
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Details" className={styles.statusDetails}>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Application ID</span>
                    <span className={styles.detailValue}>IEM-2026-{String(status.id).padStart(5, '0')}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Department</span>
                    <span className={styles.detailValue}>{status.department_name}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Current Status</span>
                    <Badge status={status.status} />
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Submitted On</span>
                    <span className={styles.detailValue}>
                        {new Date(status.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                {status.rejection_reason && (
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Rejection Reason</span>
                        <span className={styles.detailValue} style={{ color: 'var(--danger)' }}>{status.rejection_reason}</span>
                    </div>
                )}
            </Card>
        </div>
    );
}
