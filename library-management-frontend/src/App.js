import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';

import Login from './pages/auth/Login';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminBooks from './pages/admin/Books';
import AdminCategories from './pages/admin/Categories';
import AdminReports from './pages/admin/Reports';
import AdminNotifications from './pages/admin/Notifications';
import AdminConfig from './pages/admin/Config';

import LibrarianDashboard from './pages/librarian/Dashboard';
import SearchBooksLibrarian from './pages/librarian/SearchBooksLibrarian';
import IssueBook from './pages/librarian/IssueBook';
import ReturnBook from './pages/librarian/ReturnBook';
import Circulation from './pages/librarian/Circulation';
import Fines from './pages/librarian/Fines';
import Reservations from './pages/librarian/Reservations';
import StockVerification from './pages/librarian/StockVerification';

import EmployeeDashboard from './pages/employee/Dashboard';
import SearchBooks from './pages/employee/SearchBooks';
import MyBooks from './pages/employee/MyBooks';
import MyReservations from './pages/employee/MyReservations';
import MyFines from './pages/employee/MyFines';
import BookRequestForm from './pages/employee/BookRequestForm';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, token } = useAuth();

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.some(role => user.roles.includes(role))) {
        if (user.roles.includes('ADMIN')) return <Navigate to="/admin/dashboard" replace />;
        if (user.roles.includes('LIBRARIAN')) return <Navigate to="/librarian/dashboard" replace />;
        return <Navigate to="/employee/dashboard" replace />;
    }

    return children;
};

const AppRoutes = () => {
    const { user, token } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={
                token ? (
                    user?.roles?.includes('ADMIN') ? <Navigate to="/admin/dashboard" replace /> :
                    user?.roles?.includes('LIBRARIAN') ? <Navigate to="/librarian/dashboard" replace /> :
                    <Navigate to="/employee/dashboard" replace />
                ) : <Login />
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/books" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminBooks /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/config" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConfig /></ProtectedRoute>} />

            {/* Librarian Routes */}
            <Route path="/librarian/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}><LibrarianDashboard /></ProtectedRoute>} />
            <Route path="/librarian/search" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}><SearchBooksLibrarian /></ProtectedRoute>} />
            <Route path="/librarian/issue" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}><IssueBook /></ProtectedRoute>} />
            <Route path="/librarian/return" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}><ReturnBook /></ProtectedRoute>} />
            <Route path="/librarian/circulation" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}><Circulation /></ProtectedRoute>} />
            <Route path="/librarian/reservations" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}><Reservations /></ProtectedRoute>} />
            <Route path="/librarian/fines" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}><Fines /></ProtectedRoute>} />
            <Route path="/librarian/stock" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}><StockVerification /></ProtectedRoute>} />

            {/* Employee Routes */}
            <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN', 'EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee/search" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN', 'EMPLOYEE']}><SearchBooks /></ProtectedRoute>} />
            <Route path="/employee/my-books" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN', 'EMPLOYEE']}><MyBooks /></ProtectedRoute>} />
            <Route path="/employee/reservations" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN', 'EMPLOYEE']}><MyReservations /></ProtectedRoute>} />
            <Route path="/employee/my-fines" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN', 'EMPLOYEE']}><MyFines /></ProtectedRoute>} />
            <Route path="/employee/book-request" element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN', 'EMPLOYEE']}><BookRequestForm /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;