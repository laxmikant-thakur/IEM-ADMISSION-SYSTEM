import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import styles from './Sidebar.module.css';

export default function Sidebar({ items = [], sectionLabel = 'Navigation' }) {
    const { user } = useAuth();

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.navSection}>
                <div className={styles.sectionLabel}>{sectionLabel}</div>
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.active : ''}`
                        }
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            <div className={styles.sidebarFooter}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>{getInitials(user?.name)}</div>
                    <div className={styles.userDetails}>
                        <div className={styles.userName}>{user?.name}</div>
                        <div className={styles.userRole}>{user?.role}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
