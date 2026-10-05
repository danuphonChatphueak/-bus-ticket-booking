// frontend/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi
            .getDashboard()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!stats) return null;

    const cards = [
        { icon: '', label: 'จำนวนรถ', value: stats.total_buses },
        { icon: '', label: 'จำนวนเที่ยวรถ', value: stats.total_trips },
        { icon: '', label: 'จำนวนการจอง', value: stats.total_bookings },
        { icon: '', label: 'จำนวนผู้โดยสาร', value: stats.total_passengers },
        { icon: '', label: 'รายได้รวม', value: `฿${Number(stats.total_revenue).toLocaleString()}` },
    ];

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"> Dashboard</h1>
                    <p className="page-subtitle">ภาพรวมระบบจองตั๋วรถทัวร์</p>
                </div>
            </div>

            <div className="stats-grid">
                {cards.map((c, i) => (
                    <div key={i} className="stat-card slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                        <div className="stat-card-icon" style={{ background: 'var(--primary-50)', fontSize: '1.5rem' }}>
                            {c.icon}
                        </div>
                        <div className="stat-card-value">{c.value}</div>
                        <div className="stat-card-label">{c.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
