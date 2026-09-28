import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useSeats } from '../../../hooks/useSeats';
import adminService from '../../../services/adminService';
import { SeatSummary } from '../../../components/admin/SeatChart/SeatChart';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import Input from '../../../components/common/Input/Input';
import Alert from '../../../components/common/Alert/Alert';
import Loader from '../../../components/common/Loader/Loader';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
    const { user } = useAuth();
    const { departments, totalSeats, availableSeats, filledSeats, loading: seatsLoading } = useSeats();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deadline, setDeadline] = useState(null);
    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    const [newDeadline, setNewDeadline] = useState('');
    const [updateDeadlineLoading, setUpdateDeadlineLoading] = useState(false);
    const [deadlineError, setDeadlineError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, deadlineRes] = await Promise.all([
                    adminService.getDashboardStats(),
                    adminService.getDeadline()
                ]);

                if (statsRes.success) setStats(statsRes.data.stats);
                if (deadlineRes.success) setDeadline(deadlineRes.data);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || seatsLoading) return <Loader />;

    const handleUpdateDeadline = async () => {
        if (!newDeadline) {
            setDeadlineError('Please select a valid date and time');
            return;
        }
        setUpdateDeadlineLoading(true);
        setDeadlineError('');
        try {
            const res = await adminService.updateDeadline(new Date(newDeadline).toISOString());
            if (res.success) {
                setDeadline(res.data);
                setShowDeadlineModal(false);
            }
        } catch (err) {
            setDeadlineError(err.response?.data?.message || 'Failed to update deadline');
        } finally {
            setUpdateDeadlineLoading(false);
        }
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
                <p className={styles.subtitle}>Welcome back, {user?.name}</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.total}</div>
                        <div className={styles.statLabel}>Total Applications</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statValue} ${styles.awaiting}`}>{stats.awaiting}</div>
                        <div className={styles.statLabel}>Awaiting Review</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statValue} ${styles.accepted}`}>{stats.accepted}</div>
                        <div className={styles.statLabel}>Accepted</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statValue} ${styles.rejected}`}>{stats.rejected}</div>
                        <div className={styles.statLabel}>Rejected</div>
                    </div>
                </div>
            )}

            {/* Deadline Info */}
            {deadline && (
                <div className={styles.section}>
                    <Card title="Application Deadline">
                        <div className={styles.deadlineInfo}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                                <span className={styles.deadlineValue}>
                                    {new Date(deadline.deadline).toLocaleDateString('en-IN', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                                <Badge status={deadline.isPassed ? 'rejected' : 'accepted'}>
                                    {deadline.isPassed ? 'Deadline Passed' : 'Accepting Applications'}
                                </Badge>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => {
                                setNewDeadline(new Date(deadline.deadline).toISOString().slice(0, 16));
                                setDeadlineError('');
                                setShowDeadlineModal(true);
                            }}>
                                Edit Deadline
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Department Seat Charts */}
            <div className={styles.section}>
                <Card title="Department Seats">
                    <SeatSummary
                        departments={departments}
                        showStats={true}
                        totalSeats={totalSeats}
                        availableSeats={availableSeats}
                        filledSeats={filledSeats}
                    />
                </Card>
            </div>



            {/* Deadline Modal */}
            <Modal isOpen={showDeadlineModal} onClose={() => setShowDeadlineModal(false)} title="Update Application Deadline">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {deadlineError && <Alert type="error">{deadlineError}</Alert>}
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                        Set the date and time when the application portal should close. After this time, no new applications can be submitted.
                    </p>
                    <Input
                        type="datetime-local"
                        label="New Deadline"
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                        <Button variant="secondary" onClick={() => setShowDeadlineModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleUpdateDeadline} loading={updateDeadlineLoading}>Update Deadline</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
