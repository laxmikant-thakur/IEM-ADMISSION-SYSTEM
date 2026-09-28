import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const redirectTo = isAdmin ? '/admin/login' : '/login';
        await logout();
        navigate(redirectTo);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link to="/" className={styles.brand}>
                    <span className={styles.logo}>
                        IEM
                        <span className={styles.logoAccent}>Admission Portal</span>
                    </span>
                </Link>

                <div className={styles.nav}>
                    {!isAuthenticated && (
                        <>
                            <NavLink to="/login" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                                Login
                            </NavLink>
                            <NavLink to="/register" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                                Register
                            </NavLink>
                            <NavLink to="/admin/login" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                                Admin
                            </NavLink>
                        </>
                    )}

                    {isAuthenticated && (
                        <>
                            <span className={styles.welcomeText}>
                                Welcome, <strong>{user?.name}</strong>
                            </span>
                            <button className={styles.logoutBtn} onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
