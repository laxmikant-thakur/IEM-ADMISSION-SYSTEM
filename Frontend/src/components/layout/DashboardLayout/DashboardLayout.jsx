import Sidebar from '../Sidebar/Sidebar';
import styles from './DashboardLayout.module.css';

const adminNavItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/applications', label: 'Applications', icon: '📋' },
    { to: '/admin/students', label: 'Students', icon: '🎓' },
    { to: '/admin/seat-management', label: 'Seat Management', icon: '💺' },
];

const applicantNavItems = [
    { to: '/applicant/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/applicant/application', label: 'Apply', icon: '📝' },
    { to: '/applicant/status', label: 'Status', icon: '📊' },
];

export function AdminLayout({ children }) {
    return (
        <div className={styles.layout}>
            <Sidebar items={adminNavItems} sectionLabel="Admin Panel" />
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}

export function ApplicantLayout({ children }) {
    return (
        <div className={styles.layout}>
            <Sidebar items={applicantNavItems} sectionLabel="Applicant" />
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
