// frontend/src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await adminApi.getUsers();
            setUsers(data);
        } catch (err) {
            showToast('ไม่สามารถโหลดข้อมูลผู้ใช้ได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"> จัดการผู้ใช้</h1>
                </div>
            </div>

            <div className="table-container slide-up">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ชื่อ</th>
                            <th>Email</th>
                            <th>บทบาท</th>
                            <th>วันที่สมัคร</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td style={{ fontWeight: 600 }}>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{formatDate(user.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
