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

            {/* Features */}
            <section style={{ padding: '40px 0' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 24,
                    maxWidth: 1000,
                    margin: '0 auto'
                }}>
                    {[
                        { icon: '', title: 'ค้นหาง่าย', desc: 'ค้นหาเที่ยวรถจากต้นทาง ปลายทาง และวันที่เดินทาง' },
                        { icon: '', title: 'เลือกที่นั่ง', desc: 'ดูผังที่นั่งและเลือกที่นั่งที่ต้องการได้เลย' },
                        { icon: '', title: 'รับ E-Ticket', desc: 'รับตั๋วอิเล็กทรอนิกส์พร้อม QR Code ทันที' },
                        { icon: '', title: 'ใช้งานได้ทุกที่', desc: 'รองรับทุกอุปกรณ์ทั้ง Desktop และ Mobile' },
                    ].map((f, i) => (
                        <div key={i} className="card slide-up" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{f.icon}</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.desc}</p>
                        </div>
                    ))}
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
