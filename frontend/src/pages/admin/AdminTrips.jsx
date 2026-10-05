// frontend/src/pages/admin/AdminTrips.jsx
import { useState, useEffect } from 'react';
import { tripApi, busApi, routeApi } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function AdminTrips() {
    const [trips, setTrips] = useState([]);
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ id: null, bus_id: '', route_id: '', travel_date: '', departure_time: '', arrival_time: '', price: '', status: 'active' });
    const { showToast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tripsData, busesData, routesData] = await Promise.all([
                tripApi.getAll(),
                busApi.getAll(),
                routeApi.getAll()
            ]);
            setTrips(tripsData);
            setBuses(busesData);
            setRoutes(routesData);
        } catch (err) {
            showToast('ไม่สามารถโหลดข้อมูลได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (trip = null) => {
        if (trip) {
            setForm({
                ...trip,
                travel_date: trip.travel_date ? trip.travel_date.split('T')[0] : '', // Extract YYYY-MM-DD
                departure_time: trip.departure_time ? trip.departure_time.substring(0, 5) : '',
                arrival_time: trip.arrival_time ? trip.arrival_time.substring(0, 5) : '',
            });
        } else {
            setForm({ id: null, bus_id: '', route_id: '', travel_date: '', departure_time: '', arrival_time: '', price: '', status: 'active' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (form.id) {
                await tripApi.update(form.id, form);
                showToast('อัปเดตเที่ยวรถสำเร็จ');
            } else {
                await tripApi.create(form);
                showToast('เพิ่มเที่ยวรถสำเร็จ');
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            showToast(err.message || 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('ยืนยันการลบเที่ยวรถนี้?')) return;
        try {
            await tripApi.delete(id);
            showToast('ลบสำเร็จ');
            loadData();
        } catch (err) {
            showToast('ไม่สามารถลบได้ (อาจมีการจองตั๋วในเที่ยวรถนี้แล้ว)', 'error');
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

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"> จัดการเที่ยวรถ</h1>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    + เพิ่มเที่ยวรถใหม่
                </button>
            </div>

            <div className="table-container slide-up">
                <table className="table">
                    <thead>
                        <tr>
                            <th>เส้นทาง</th>
                            <th>วันที่เดินทาง</th>
                            <th>เวลา</th>
                            <th>รถ (บริษัท)</th>
                            <th>ราคา</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip) => (
                            <tr key={trip.id}>
                                <td>{trip.origin} → {trip.destination}</td>
                                <td>{formatDate(trip.travel_date)}</td>
                                <td>{formatTime(trip.departure_time)} - {formatTime(trip.arrival_time)}</td>
                                <td>{trip.bus_number} ({trip.company_name})</td>
                                <td>฿{Number(trip.price).toLocaleString()}</td>
                                <td>
                                    <span className={`badge ${trip.status === 'active' ? 'badge-success' : trip.status === 'completed' ? 'badge-info' : 'badge-danger'}`}>
                                        {trip.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(trip)}>
                                            แก้ไข
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(trip.id)}>
                                            ลบ
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{form.id ? 'แก้ไขเที่ยวรถ' : 'เพิ่มเที่ยวรถใหม่'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">เส้นทาง</label>
                                <select required className="form-select" value={form.route_id} onChange={(e) => setForm({...form, route_id: e.target.value})}>
                                    <option value="">-- เลือกเส้นทาง --</option>
                                    {routes.map(r => (
                                        <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">รถ</label>
                                <select required className="form-select" value={form.bus_id} onChange={(e) => setForm({...form, bus_id: e.target.value})}>
                                    <option value="">-- เลือกรถ --</option>
                                    {buses.map(b => (
                                        <option key={b.id} value={b.id}>{b.bus_number} - {b.bus_type} ({b.company_name}) - {b.total_seats} ที่นั่ง</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">วันที่เดินทาง</label>
                                    <input required type="date" className="form-input" value={form.travel_date} onChange={(e) => setForm({...form, travel_date: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">ราคา</label>
                                    <input required type="number" min="0" step="0.01" className="form-input" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">เวลาออก</label>
                                    <input required type="time" className="form-input" value={form.departure_time} onChange={(e) => setForm({...form, departure_time: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">เวลาถึง</label>
                                    <input required type="time" className="form-input" value={form.arrival_time} onChange={(e) => setForm({...form, arrival_time: e.target.value})} />
                                </div>
                            </div>
                            {form.id && (
                                <div className="form-group">
                                    <label className="form-label">สถานะ</label>
                                    <select required className="form-select" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            )}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
                                <button type="submit" className="btn btn-primary">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
