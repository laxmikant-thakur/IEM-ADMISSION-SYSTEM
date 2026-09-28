import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader/Loader';

export default function ProtectedRoute({ children, role }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <Loader fullPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />;
    }

    if (role && user?.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
}
