// frontend/src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
    const { isAdmin, loading } = useAuth();

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!isAdmin) return <Navigate to="/" replace />;

    const navItems = [
        { to: '/admin', label: ' Dashboard', end: true },
        { to: '/admin/buses', label: ' จัดการรถ' },
        { to: '/admin/routes', label: '️ จัดการเส้นทาง' },
        { to: '/admin/trips', label: ' จัดการเที่ยวรถ' },
        { to: '/admin/bookings', label: ' จัดการการจอง' },
        { to: '/admin/users', label: ' จัดการผู้ใช้' },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-title">️ Admin Panel</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
