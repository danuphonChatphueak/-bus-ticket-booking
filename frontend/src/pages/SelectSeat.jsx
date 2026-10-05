// frontend/src/pages/SelectSeat.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi, bookingApi } from '../services/api';
import { useToast } from '../components/Toast';

export default function SelectSeat() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [trip, setTrip] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        loadData();
    }, [tripId]);

    const loadData = async () => {
        try {
            const [tripData, seatData] = await Promise.all([
                tripApi.getById(tripId),
                tripApi.getSeats(tripId),
            ]);
            setTrip(tripData);
            setSeats(seatData.seats);
        } catch (err) {
            showToast('ไม่สามารถโหลดข้อมูลเที่ยวรถได้', 'error');
            navigate('/search');
        } finally {
            setLoading(false);
        }
    };

    const toggleSeat = (seat) => {
        if (seat.status === 'booked') return;

        setSelectedSeats((prev) => {
            if (prev.find((s) => s.id === seat.id)) {
                return prev.filter((s) => s.id !== seat.id);
            }
            return [...prev, seat];
        });
    };

    const handleBooking = async () => {
        if (selectedSeats.length === 0) {
            showToast('กรุณาเลือกที่นั่งอย่างน้อย 1 ที่นั่ง', 'error');
            return;
        }

        setBooking(true);
        try {
            const data = await bookingApi.create({
                trip_id: parseInt(tripId),
                seat_ids: selectedSeats.map((s) => s.id),
            });
            showToast('จองตั๋วสำเร็จ!');
            navigate(`/ticket/${data.booking.id}`);
        } catch (err) {
            showToast(err.message || 'ไม่สามารถจองตั๋วได้', 'error');
            // Reload seats in case of conflict
            loadData();
            setSelectedSeats([]);
        } finally {
            setBooking(false);
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

    if (!trip) return null;

    const totalPrice = selectedSeats.length * Number(trip.price);

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"> เลือกที่นั่ง</h1>
                    <p className="page-subtitle">
                        {trip.origin} → {trip.destination} | {formatDate(trip.travel_date)} | {formatTime(trip.departure_time)}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/search')}>
                    ← กลับ
                </button>
            </div>

            <div className="seat-map-container">
                {/* Seat Map */}
                <div className="seat-map">
                    <div className="seat-map-header"> DRIVER</div>

                    <div className="seat-grid">
                        {seats.map((seat) => {
                            const isSelected = selectedSeats.find((s) => s.id === seat.id);
                            let className = 'seat ';
                            if (seat.status === 'booked') className += 'seat-booked';
                            else if (isSelected) className += 'seat-selected';
                            else className += 'seat-available';

                            return (
                                <div
                                    key={seat.id}
                                    className={className}
                                    onClick={() => toggleSeat(seat)}
                                    title={`ที่นั่ง ${seat.seat_number} - ${seat.status === 'booked' ? 'ถูกจองแล้ว' : isSelected ? 'เลือกอยู่' : 'ว่าง'}`}
                                >
                                    {seat.seat_number}
                                </div>
                            );
                        })}
                    </div>

                    <div className="seat-map-footer">BACK</div>

                    <div className="seat-legend">
                        <div className="seat-legend-item">
                            <div className="seat-legend-box" style={{ background: 'var(--seat-available)' }}></div>
                            ว่าง
                        </div>
                        <div className="seat-legend-item">
                            <div className="seat-legend-box" style={{ background: 'var(--seat-selected)' }}></div>
                            เลือกอยู่
                        </div>
                        <div className="seat-legend-item">
                            <div className="seat-legend-box" style={{ background: 'rgba(229,62,62,0.3)' }}></div>
                            ถูกจองแล้ว
                        </div>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="booking-summary">
                    <h3> สรุปการจอง</h3>

                    <div className="summary-row">
                        <span className="summary-label">เส้นทาง</span>
                        <span className="summary-value">{trip.origin} → {trip.destination}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">วันที่</span>
                        <span className="summary-value">{formatDate(trip.travel_date)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">เวลาออก</span>
                        <span className="summary-value">{formatTime(trip.departure_time)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">เวลาถึง</span>
                        <span className="summary-value">{formatTime(trip.arrival_time)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">บริษัท</span>
                        <span className="summary-value">{trip.company_name}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">ประเภทรถ</span>
                        <span className="summary-value">{trip.bus_type}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">ราคาต่อที่นั่ง</span>
                        <span className="summary-value">฿{Number(trip.price).toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">ที่นั่งที่เลือก</span>
                        <span className="summary-value">
                            {selectedSeats.length > 0
                                ? selectedSeats.map((s) => s.seat_number).join(', ')
                                : '-'}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">จำนวน</span>
                        <span className="summary-value">{selectedSeats.length} ที่นั่ง</span>
                    </div>

                    <div className="summary-row summary-total">
                        <span className="summary-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            รวมทั้งหมด
                        </span>
                        <span className="summary-value">
                            ฿{totalPrice.toLocaleString()}
                        </span>
                    </div>

                    <button
                        className="btn btn-primary btn-block btn-lg"
                        style={{ marginTop: 24 }}
                        onClick={handleBooking}
                        disabled={selectedSeats.length === 0 || booking}
                    >
                        {booking ? ' กำลังจอง...' : ' ยืนยันการจอง'}
                    </button>
                </div>
            </div>
        </div>
    );
}
