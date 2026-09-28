import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import { useSeats } from '../../../hooks/useSeats';
import { SeatSummary } from '../../../components/admin/SeatChart/SeatChart';
import Badge from '../../../components/common/Badge/Badge';
import Loader from '../../../components/common/Loader/Loader';
import styles from './AdminApplications.module.css';

export default function AdminApplications() {
    const { departments } = useSeats();
    const [applications, setApplications] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchApplications(); }, []);

    useEffect(() => {
        // Only show 'waiting' applications on this page
        let result = applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review');
        
        if (deptFilter) result = result.filter(a => a.department_id === parseInt(deptFilter, 10));
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(a =>
                a.applicant_name.toLowerCase().includes(s) ||
                a.applicant_email.toLowerCase().includes(s) ||
                a.department_name.toLowerCase().includes(s) ||
                String(a.id).includes(s)
            );
        }
        setFiltered(result);
    }, [applications, search, deptFilter]);

    const fetchApplications = async () => {
        try {
            const res = await adminService.getApplications();
            if (res.success) {
                setApplications(res.data.applications);
                setFiltered(res.data.applications);
            }
        } catch { /* ignore */ }
        setLoading(false);
    };

    if (loading) return <Loader fullPage />;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Applications</h1>
                <div className={styles.filters}>
                    <input
                        className={styles.searchInput}
                        placeholder="Search by name, email, department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className={styles.filterSelect}
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.section} style={{ marginBottom: 'var(--space-6)' }}>
                <SeatSummary departments={departments} />
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Applicant</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Submitted</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr><td colSpan="6" className={styles.emptyRow}>No applications found</td></tr>
                    ) : (
                        filtered.map(app => (
                            <tr key={app.id} onClick={() => navigate(`/admin/applications/${app.id}`)}>
                                <td>{app.id}</td>
                                <td style={{ fontWeight: 500 }}>{app.applicant_name}</td>
                                <td>{app.applicant_email}</td>
                                <td>{app.department_name}</td>
                                <td><Badge status={app.status} /></td>
                                <td>{new Date(app.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
