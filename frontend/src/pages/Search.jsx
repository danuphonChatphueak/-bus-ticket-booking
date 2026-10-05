// frontend/src/pages/Search.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi, routeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Search() {
    const [routes, setRoutes] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ origin: '', destination: '', travel_date: '' });

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Load routes and initial trips
    useEffect(() => {
        routeApi.getAll().then(setRoutes).catch(() => {});
        tripApi.getAll().then(setTrips).catch(() => {}).finally(() => setLoading(false));
    }, []);

    // Get unique origins and destinations
    const origins = [...new Set(routes.map((r) => r.origin))];
    const destinations = [...new Set(routes.map((r) => r.destination))];

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const params = {};
            if (filters.origin) params.origin = filters.origin;
            if (filters.destination) params.destination = filters.destination;
            if (filters.travel_date) params.travel_date = filters.travel_date;

            const data = await tripApi.getAll(params);
            setTrips(data);
            if (data.length === 0) {
                showToast('ไม่พบเที่ยวรถที่ค้นหา', 'error');
            }
        } catch (err) {
            showToast('เกิดข้อผิดพลาดในการค้นหา', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTrip = (trip) => {
        if (!isAuthenticated) {
            showToast('กรุณาเข้าสู่ระบบก่อนจองตั๋ว', 'error');
            navigate('/login');
            return;
        }
        navigate(`/select-seat/${trip.id}`);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        return timeStr.substring(0, 5);
    };

    return (
        <div className="fade-in">
            <section className="hero" style={{ padding: '40px 20px' }}>
                <h1> ค้นหาเที่ยวรถ</h1>
                <p>เลือกต้นทาง ปลายทาง และวันที่เดินทาง</p>

                <form className="search-box slide-up" onSubmit={handleSearch}>
                    <div className="search-grid">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">ต้นทาง</label>
                            <select
                                className="form-select"
                                value={filters.origin}
                                onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
                            >
                                <option value="">-- เลือกต้นทาง --</option>
                                {origins.map((o) => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">ปลายทาง</label>
                            <select
                                className="form-select"
                                value={filters.destination}
                                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                            >
                                <option value="">-- เลือกปลายทาง --</option>
                                {destinations.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">วันที่เดินทาง</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.travel_date}
                                onChange={(e) => setFilters({ ...filters, travel_date: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? '' : ''} ค้นหา
                        </button>
                    </div>
                </form>
            </section>

            {/* Results */}
            <div className="trip-list">
                {trips.length === 0 && !loading ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"></div>
                        <p className="empty-state-text">ไม่พบเที่ยวรถ</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            ลองเปลี่ยนเงื่อนไขการค้นหาใหม่
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
                            พบ {trips.length} เที่ยวรถ
                        </h2>
                        {trips.map((trip) => (
                            <div
                                key={trip.id}
                                className="trip-card"
                                onClick={() => handleSelectTrip(trip)}
                            >
                                <div>
                                    <div className="trip-route">
                                        <span>{trip.origin}</span>
                                        <span className="trip-route-arrow">→</span>
                                        <span>{trip.destination}</span>
                                    </div>
                                    <div className="trip-details" style={{ marginTop: 12 }}>
                                        <span className="trip-detail-item">
                                             {trip.company_name}
                                        </span>
                                        <span className="trip-detail-item">
                                             {trip.bus_number}
                                        </span>
                                        <span className="trip-detail-item">
                                            ️ {trip.bus_type}
                                        </span>
                                    </div>
                                </div>

                                <div className="trip-details" style={{ flexDirection: 'column', gap: 8 }}>
                                    <span className="trip-detail-item">
                                         {formatDate(trip.travel_date)}
                                    </span>
                                    <span className="trip-detail-item">
                                         {formatTime(trip.departure_time)} - {formatTime(trip.arrival_time)}
                                    </span>
                                    <span className="trip-detail-item">
                                         ว่าง {trip.available_seats} ที่นั่ง
                                    </span>
                                </div>

                                <div>
                                    <div className="trip-price">
                                        ฿{Number(trip.price).toLocaleString()}
                                        <div className="trip-price-label">ต่อที่นั่ง</div>
                                    </div>
                                    <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                                        เลือก →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
