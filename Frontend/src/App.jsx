import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout
import Navbar from './components/layout/Navbar/Navbar';
import Footer from './components/layout/Footer/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AdminLayout, ApplicantLayout } from './components/layout/DashboardLayout/DashboardLayout';

// Public Pages
import Home from './pages/public/Home/Home';
import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';

// Applicant Pages
import Dashboard from './pages/applicant/Dashboard/Dashboard';
import Application from './pages/applicant/Application/Application';
import Status from './pages/applicant/Status/Status';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard';
import AdminApplications from './pages/admin/Applications/AdminApplications';
import AdminApplicationDetails from './pages/admin/ApplicationDetails/AdminApplicationDetails';
import AdminStudents from './pages/admin/Students/AdminStudents';
import SeatManagement from './pages/admin/SeatManagement/SeatManagement';

// Loader
import Loader from './components/common/Loader/Loader';

export default function App() {
    const { loading } = useAuth();

    if (loading) {
        return <Loader fullPage />;
    }

    return (
        <>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Applicant Routes */}
                <Route path="/applicant/dashboard" element={
                    <ProtectedRoute role="applicant">
                        <ApplicantLayout><Dashboard /></ApplicantLayout>
                    </ProtectedRoute>
                } />
                <Route path="/applicant/application" element={
                    <ProtectedRoute role="applicant">
                        <ApplicantLayout><Application /></ApplicantLayout>
                    </ProtectedRoute>
                } />
                <Route path="/applicant/status" element={
                    <ProtectedRoute role="applicant">
                        <ApplicantLayout><Status /></ApplicantLayout>
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute role="admin">
                        <AdminLayout><AdminDashboard /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/applications" element={
                    <ProtectedRoute role="admin">
                        <AdminLayout><AdminApplications /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/applications/:id" element={
                    <ProtectedRoute role="admin">
                        <AdminLayout><AdminApplicationDetails /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/students" element={
                    <ProtectedRoute role="admin">
                        <AdminLayout><AdminStudents /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/seat-management" element={
                    <ProtectedRoute role="admin">
                        <AdminLayout><SeatManagement /></AdminLayout>
                    </ProtectedRoute>
                } />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
        </>
    );
}
