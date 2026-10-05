// frontend/src/pages/admin/AdminBookings.jsx
import { useState, useEffect } from 'react';
import { bookingApi } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function AdminBookings() {
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

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${status}?`)) return;
        try {
            await bookingApi.updateStatus(id, status);
            showToast('อัปเดตสถานะสำเร็จ');
            loadBookings();
        } catch (err) {
            showToast(err.message || 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"> จัดการการจอง</h1>
                </div>
            </div>

            <div className="table-container slide-up">
                <table className="table">
                    <thead>
                        <tr>
                            <th>รหัสจอง</th>
                            <th>ผู้โดยสาร</th>
                            <th>เส้นทาง</th>
                            <th>วันที่เดินทาง</th>
                            <th>ที่นั่ง</th>
                            <th>ราคา</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b.id}>
                                <td style={{ fontWeight: 600 }}>{b.booking_code}</td>
                                <td>
                                    <div>{b.passenger_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.passenger_email}</div>
                                </td>
                                <td>{b.origin} → {b.destination}</td>
                                <td>
                                    <div>{new Date(b.travel_date).toLocaleDateString('th-TH')}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.departure_time?.substring(0, 5)}</div>
                                </td>
                                <td>{b.seat_numbers}</td>
                                <td>฿{Number(b.total_price).toLocaleString()}</td>
                                <td>
                                    <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                                        {b.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {b.status === 'CONFIRMED' ? (
                                            <button className="btn btn-sm btn-danger" onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}>
                                                ยกเลิก
                                            </button>
                                        ) : (
                                            <button className="btn btn-sm btn-success" onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}>
                                                ยืนยัน
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
