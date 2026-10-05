// frontend/src/pages/admin/AdminBuses.jsx
import { useState, useEffect } from 'react';
import { busApi } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function AdminBuses() {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ id: null, bus_number: '', bus_type: 'VIP', company_name: '', total_seats: 40, amenities: '' });
    const { showToast } = useToast();

    useEffect(() => {
        loadBuses();
    }, []);

    const loadBuses = async () => {
        try {
            const data = await busApi.getAll();
            setBuses(data);
        } catch (err) {
            showToast('ไม่สามารถโหลดข้อมูลรถได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (bus = null) => {
        if (bus) {
            setForm(bus);
        } else {
            setForm({ id: null, bus_number: '', bus_type: 'VIP', company_name: '', total_seats: 40, amenities: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (form.id) {
                await busApi.update(form.id, form);
                showToast('อัปเดตข้อมูลรถสำเร็จ');
            } else {
                await busApi.create(form);
                showToast('เพิ่มรถสำเร็จ');
            }
            setShowModal(false);
            loadBuses();
        } catch (err) {
            showToast(err.message || 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('ยืนยันการลบรถคันนี้?')) return;
        try {
            await busApi.delete(id);
            showToast('ลบสำเร็จ');
            loadBuses();
        } catch (err) {
            showToast('ไม่สามารถลบได้ (อาจมีข้อมูลที่เกี่ยวข้องอยู่)', 'error');
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"> จัดการรถ</h1>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    + เพิ่มรถใหม่
                </button>
            </div>

            <div className="table-container slide-up">
                <table className="table">
                    <thead>
                        <tr>
                            <th>หมายเลขรถ</th>
                            <th>ประเภทรถ</th>
                            <th>บริษัท</th>
                            <th>จำนวนที่นั่ง</th>
                            <th>สิ่งอำนวยความสะดวก</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buses.map((bus) => (
                            <tr key={bus.id}>
                                <td style={{ fontWeight: 600 }}>{bus.bus_number}</td>
                                <td>{bus.bus_type}</td>
                                <td>{bus.company_name}</td>
                                <td>{bus.total_seats}</td>
                                <td>{bus.amenities}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(bus)}>
                                            แก้ไข
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(bus.id)}>
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
                            <h2 className="modal-title">{form.id ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถใหม่'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">หมายเลขรถ</label>
                                <input required className="form-input" value={form.bus_number} onChange={(e) => setForm({...form, bus_number: e.target.value})} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">ประเภทรถ</label>
                                    <select className="form-select" value={form.bus_type} onChange={(e) => setForm({...form, bus_type: e.target.value})}>
                                        <option value="Standard">Standard</option>
                                        <option value="Express">Express</option>
                                        <option value="VIP">VIP</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">จำนวนที่นั่ง</label>
                                    <input required type="number" min="1" className="form-input" value={form.total_seats} onChange={(e) => setForm({...form, total_seats: parseInt(e.target.value)})} disabled={!!form.id} title={form.id ? 'ไม่สามารถแก้จำนวนที่นั่งได้หลังจากสร้างแล้ว' : ''} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">บริษัท</label>
                                <input required className="form-input" value={form.company_name} onChange={(e) => setForm({...form, company_name: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">สิ่งอำนวยความสะดวก</label>
                                <input className="form-input" value={form.amenities} onChange={(e) => setForm({...form, amenities: e.target.value})} />
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
