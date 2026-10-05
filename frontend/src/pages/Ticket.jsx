// frontend/src/pages/Ticket.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingApi } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

export default function Ticket() {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

    const loadBooking = async () => {
        try {
            const data = await bookingApi.getById(bookingId);
            setBooking(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        return timeStr.substring(0, 5);
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    if (!booking) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon"></div>
                <p className="empty-state-text">ไม่พบข้อมูลการจอง</p>
                <Link to="/my-bookings" className="btn btn-primary" style={{ marginTop: 16 }}>
                    ดูการจองของฉัน
                </Link>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ padding: '40px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 className="page-title"> ตั๋วของคุณ</h1>
                <p className="page-subtitle">แสดงตั๋วนี้ให้พนักงานเมื่อขึ้นรถ</p>
            </div>

            <div className="ticket slide-up">
                <div className="ticket-header">
                    <h2> BUS TICKET</h2>
                </div>

                <div className="ticket-body">
                    <div className="ticket-row">
                        <div>
                            <div className="ticket-label">Booking</div>
                            <div className="ticket-value">{booking.booking_code}</div>
                        </div>
                    </div>

                    <hr className="ticket-divider" />

                    <div className="ticket-route">
                        {booking.origin} → {booking.destination}
                    </div>

                    <hr className="ticket-divider" />

                    <div className="ticket-row">
                        <div>
                            <div className="ticket-label">Date</div>
                            <div className="ticket-value">{formatDate(booking.travel_date)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="ticket-label">Departure</div>
                            <div className="ticket-value">{formatTime(booking.departure_time)}</div>
                        </div>
                    </div>

                    <div className="ticket-row">
                        <div>
                            <div className="ticket-label">Seat</div>
                            <div className="ticket-value">{booking.seat_numbers}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="ticket-label">Price</div>
                            <div className="ticket-value">฿{Number(booking.total_price).toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="ticket-row">
                        <div>
                            <div className="ticket-label">Bus</div>
                            <div className="ticket-value">{booking.bus_number} ({booking.bus_type})</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="ticket-label">Company</div>
                            <div className="ticket-value">{booking.company_name}</div>
                        </div>
                    </div>

                    <hr className="ticket-divider" />

                    <div className="ticket-qr">
                        <QRCodeSVG
                            value={booking.booking_code}
                            size={150}
                            bgColor="transparent"
                            fgColor="#e2e8f0"
                            level="M"
                        />
                    </div>

                    <div className="ticket-status">
                        <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                            {booking.status === 'CONFIRMED' ? ' CONFIRMED' : ' CANCELLED'}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Link to="/my-bookings" className="btn btn-secondary">
                    ← กลับไปการจองของฉัน
                </Link>
            </div>
        </div>
    );
}
