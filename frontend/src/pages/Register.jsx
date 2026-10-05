// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            showToast('รหัสผ่านไม่ตรงกัน', 'error');
            return;
        }
        setLoading(true);
        try {
            const data = await authApi.register({
                name: form.name,
                email: form.email,
                password: form.password,
            });
            login(data.token, data.user);
            showToast('สมัครสมาชิกสำเร็จ!');
            navigate('/');
        } catch (err) {
            showToast(err.message || 'สมัครสมาชิกล้มเหลว', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: 440, margin: '60px auto' }}>
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}></div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>สมัครสมาชิก</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>
                        สร้างบัญชีใหม่เพื่อเริ่มจองตั๋ว
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">ชื่อ</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="ชื่อของคุณ"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">รหัสผ่าน</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="อย่างน้อย 6 ตัวอักษร"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">ยืนยันรหัสผ่าน</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="กรอกรหัสผ่านอีกครั้ง"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
                </p>
            </div>
        </div>
    );
}
