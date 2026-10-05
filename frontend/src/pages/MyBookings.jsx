// frontend/src/pages/MyBookings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../services/api';
import { useToast } from '../components/Toast';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await bookingApi.getAll();
            setBookings(data);
        } catch (err) {
            showToast('ไม่สามารถโหลดข้อมูลการจองได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('ยืนยันการยกเลิกการจองนี้?')) return;
        try {
            await bookingApi.cancel(id);
            showToast('ยกเลิกการจองสำเร็จ');
            loadBookings();
        } catch (err) {
            showToast(err.message || 'ไม่สามารถยกเลิกได้', 'error');
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        return timeStr.substring(0, 5);
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"> การจองของฉัน</h1>
                    <p className="page-subtitle">ดูและจัดการรายการจองตั๋วทั้งหมดของคุณ</p>
                </div>
                <Link to="/search" className="btn btn-primary">
                    + จองตั๋วใหม่
                </Link>
            </div>

            {bookings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"></div>
                    <p className="empty-state-text">ยังไม่มีการจอง</p>
                    <Link to="/search" className="btn btn-primary" style={{ marginTop: 16 }}>
                        เริ่มจองเลย
                    </Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>รหัสจอง</th>
                                <th>เส้นทาง</th>
                                <th>วันที่</th>
                                <th>เวลา</th>
                                <th>ที่นั่ง</th>
                                <th>ราคา</th>
                                <th>สถานะ</th>
                                <th>การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => (
                                <tr key={b.id}>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>
                                            {b.booking_code}
                                        </span>
                                    </td>
                                    <td>{b.origin} → {b.destination}</td>
                                    <td>{formatDate(b.travel_date)}</td>
                                    <td>{formatTime(b.departure_time)}</td>
                                    <td>{b.seat_numbers}</td>
                                    <td>฿{Number(b.total_price).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <Link to={`/ticket/${b.id}`} className="btn btn-sm btn-secondary">
                                                 ตั๋ว
                                            </Link>
                                            {b.status === 'CONFIRMED' && (
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleCancel(b.id)}
                                                >
                                                     ยกเลิก
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
