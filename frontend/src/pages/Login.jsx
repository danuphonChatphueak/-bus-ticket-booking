// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authApi.login(form);
            login(data.token, data.user);
            showToast('เข้าสู่ระบบสำเร็จ!');
            navigate(data.user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            showToast(err.message || 'เข้าสู่ระบบล้มเหลว', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: 440, margin: '60px auto' }}>
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}></div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>เข้าสู่ระบบ</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>
                        ลงชื่อเข้าใช้งานเพื่อจองตั๋ว
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
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
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
                </p>
            </div>
        </div>
    );
}
