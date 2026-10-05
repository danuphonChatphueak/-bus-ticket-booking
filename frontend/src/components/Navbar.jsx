// frontend/src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getLinkClass = (path) => {
        return `nav-link ${location.pathname === path ? 'active' : ''}`;
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                        <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4S4 2.5 4 6v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                    </svg>
                    Bus Ticket
                </Link>

                <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    ☰
                </button>

                <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
                    <Link to="/" className={getLinkClass('/')} onClick={() => setMenuOpen(false)}>
                        หน้าแรก
                    </Link>
                    <Link to="/search" className={getLinkClass('/search')} onClick={() => setMenuOpen(false)}>
                        ค้นหา
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/my-bookings" className={getLinkClass('/my-bookings')} onClick={() => setMenuOpen(false)}>
                                การจองของฉัน
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" className={getLinkClass('/admin')} onClick={() => setMenuOpen(false)}>
                                    จัดการระบบ
                                </Link>
                            )}
                            <div className="nav-user">
                                <div className="nav-user-avatar">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <span>{user?.name}</span>
                            </div>
                            <button className="btn btn-secondary nav-btn" onClick={handleLogout}>
                                ออกจากระบบ
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary nav-btn" onClick={() => setMenuOpen(false)}>
                                เข้าสู่ระบบ
                            </Link>
                            <Link to="/register" className="btn btn-primary nav-btn-primary" onClick={() => setMenuOpen(false)}>
                                สมัครสมาชิก
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
