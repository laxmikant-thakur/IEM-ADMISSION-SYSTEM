import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeats } from '../../../hooks/useSeats';
import adminService from '../../../services/adminService';
import { SeatSummary } from '../../../components/admin/SeatChart/SeatChart';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Loader from '../../../components/common/Loader/Loader';
import styles from './AdminStudents.module.css';

const STATUS_TABS = [
    { key: '', label: 'All Students' },
    { key: 'awaiting', label: 'Awaiting Review' },
    { key: 'Accepted', label: 'Accepted' },
    { key: 'Rejected', label: 'Rejected' },
];

export default function AdminStudents() {
    const { departments } = useSeats();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const filters = {};
                if (statusFilter) filters.status = statusFilter;
                if (deptFilter) filters.department_id = deptFilter;
                const res = await adminService.getStudents(filters);
                if (res.success) setStudents(res.data.students);
            } catch (err) {
                console.error('Fetch students error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [statusFilter, deptFilter]);

    const getStatusBadge = (status) => {
        const map = {
            'Submitted': 'submitted',
            'Under Review': 'underReview',
            'Accepted': 'accepted',
            'Rejected': 'rejected'
        };
        return map[status] || 'submitted';
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Students</h1>
                <p className={styles.subtitle}>View and manage all student applications</p>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.tabs}>
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`${styles.tab} ${statusFilter === tab.key ? styles.tabActive : ''}`}
                            onClick={() => setStatusFilter(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <select
                    className={styles.filterSelect}
                    value={deptFilter}
                    onChange={e => setDeptFilter(e.target.value)}
                >
                    <option value="">All Departments</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            {/* Student List */}
            {loading ? <Loader /> : (
                <Card>
                    {students.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📭</div>
                            <p className={styles.emptyText}>No students found with the selected filters</p>
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>App ID</th>
                                        <th>Department</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        {statusFilter === 'Accepted' && <th>10th %</th>}
                                        {statusFilter === 'Accepted' && <th>12th %</th>}
                                        {statusFilter === 'Rejected' && <th>Rejection Reason</th>}
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td className={styles.studentName}>{s.applicant_name}</td>
                                            <td className={styles.appId}>APP-{String(s.id).padStart(4, '0')}</td>
                                            <td>{s.department_name}</td>
                                            <td className={styles.email}>{s.applicant_email}</td>
                                            <td><Badge status={getStatusBadge(s.status)}>{s.status}</Badge></td>
                                            {statusFilter === 'Accepted' && <td>{s.tenth_percentage}%</td>}
                                            {statusFilter === 'Accepted' && <td>{s.twelfth_percentage}%</td>}
                                            {statusFilter === 'Rejected' && (
                                                <td className={styles.rejectionCell}>{s.rejection_reason || '—'}</td>
                                            )}
                                            <td>{new Date(s.submitted_at).toLocaleDateString('en-IN')}</td>
                                            <td>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/applications/${s.id}`)}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
