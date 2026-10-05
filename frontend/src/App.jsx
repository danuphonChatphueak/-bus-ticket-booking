// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/Toast';

// Passenger Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import SelectSeat from './pages/SelectSeat';
import Ticket from './pages/Ticket';
import MyBookings from './pages/MyBookings';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminBuses from './pages/admin/AdminBuses';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminTrips from './pages/admin/AdminTrips';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';

import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />

            {/* Protected Passenger Routes */}
            <Route path="/select-seat/:tripId" element={<ProtectedRoute><SelectSeat /></ProtectedRoute>} />
            <Route path="/ticket/:bookingId" element={<ProtectedRoute><Ticket /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="buses" element={<AdminBuses />} />
              <Route path="routes" element={<AdminRoutes />} />
              <Route path="trips" element={<AdminTrips />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
