// frontend/src/pages/admin/AdminRoutes.jsx
import { useState, useEffect } from 'react';
import { routeApi } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function AdminRoutes() {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ id: null, origin: '', destination: '', distance_km: '' });
    const { showToast } = useToast();

    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        try {
            const data = await routeApi.getAll();
            setRoutes(data);
        } catch (err) {
            showToast('ไม่สามารถโหลดข้อมูลเส้นทางได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (route = null) => {
        if (route) {
            setForm(route);
        } else {
            setForm({ id: null, origin: '', destination: '', distance_km: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (form.id) {
                await routeApi.update(form.id, form);
                showToast('อัปเดตข้อมูลเส้นทางสำเร็จ');
            } else {
                await routeApi.create(form);
                showToast('เพิ่มเส้นทางสำเร็จ');
            }
            setShowModal(false);
            loadRoutes();
        } catch (err) {
            showToast(err.message || 'เกิดข้อผิดพลาด (อาจมีเส้นทางนี้แล้ว)', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('ยืนยันการลบเส้นทางนี้?')) return;
        try {
            await routeApi.delete(id);
            showToast('ลบสำเร็จ');
            loadRoutes();
        } catch (err) {
            showToast('ไม่สามารถลบได้ (อาจมีข้อมูลเที่ยวรถที่ผูกกับเส้นทางนี้อยู่)', 'error');
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">️ จัดการเส้นทาง</h1>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    + เพิ่มเส้นทางใหม่
                </button>
            </div>

            <div className="table-container slide-up">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ต้นทาง</th>
                            <th>ปลายทาง</th>
                            <th>ระยะทาง (km)</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map((route) => (
                            <tr key={route.id}>
                                <td style={{ fontWeight: 600 }}>{route.origin}</td>
                                <td style={{ fontWeight: 600 }}>{route.destination}</td>
                                <td>{route.distance_km || '-'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(route)}>
                                            แก้ไข
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(route.id)}>
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
                            <h2 className="modal-title">{form.id ? 'แก้ไขเส้นทาง' : 'เพิ่มเส้นทางใหม่'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">ต้นทาง</label>
                                <input required className="form-input" value={form.origin} onChange={(e) => setForm({...form, origin: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ปลายทาง</label>
                                <input required className="form-input" value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ระยะทาง (กิโลเมตร)</label>
                                <input type="number" step="0.01" className="form-input" value={form.distance_km} onChange={(e) => setForm({...form, distance_km: e.target.value})} />
                            </div>
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
