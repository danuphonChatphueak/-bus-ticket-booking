// frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="fade-in">
            <section className="hero">
                <h1> จองตั๋วรถทัวร์ออนไลน์</h1>
                <p>
                    ค้นหาและจองตั๋วรถทัวร์ได้ง่ายๆ เลือกที่นั่ง ยืนยันการจอง
                    พร้อมรับ E-Ticket ทันที
                </p>

                <div className="search-box slide-up">
                    <h2 style={{ marginBottom: 24, fontSize: '1.1rem', fontWeight: 700 }}>
                         ค้นหาเที่ยวรถ
                    </h2>
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/search" className="btn btn-primary btn-lg">
                            เริ่มค้นหาเลย →
                        </Link>
                    </div>
                </div>
            </section>


            {/* CTA */}
            {!isAuthenticated && (
                <section style={{ textAlign: 'center', padding: '40px 0' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>
                        พร้อมจองตั๋วแล้วหรือยัง?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                        สมัครสมาชิกฟรี เริ่มจองตั๋วได้ทันที
                    </p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        สมัครสมาชิกเลย
                    </Link>
                </section>
            )}
        </div>
    );
}
