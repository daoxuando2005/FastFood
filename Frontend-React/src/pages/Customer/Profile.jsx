import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import apiService, { API_ENDPOINTS } from '../../services/apiService';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [isCustomerExists, setIsCustomerExists] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Password fields
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
    const [pwdLoading, setPwdLoading] = useState(false);

    useEffect(() => {
        if (user && user.userId) {
            fetchCustomerData();
        }
    }, [user]);

    const fetchCustomerData = async () => {
        try {
            const res = await apiService.get(`${API_ENDPOINTS.CUSTOMER}/${user.userId}`);
            if (res.data) {
                setFullName(res.data.fullname || '');
                setPhone(res.data.phoneNumber || '');
                setIsCustomerExists(true);
            }
        } catch (err) {
            if (err.response?.status === 404 || err.response?.status === 500) {
                // Customer record might not exist yet
                setIsCustomerExists(false);
            }
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        setLoading(true);

        const payload = {
            userId: user.userId,
            fullname: fullName,
            phoneNumber: phone,
            email: user.email
        };

        try {
            if (isCustomerExists) {
                await apiService.put(`${API_ENDPOINTS.CUSTOMER}/${user.userId}`, payload);
            } else {
                await apiService.post(API_ENDPOINTS.CUSTOMER, payload);
                setIsCustomerExists(true);
            }
            setMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Lỗi khi cập nhật thông tin.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwdMsg({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }

        setPwdLoading(true);
        try {
            const res = await apiService.post(`${API_ENDPOINTS.AUTH}/change-password`, {
                email: user.email,
                oldPassword,
                newPassword
            });
            setPwdMsg({ type: 'success', text: res.data.message || 'Đổi mật khẩu thành công!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Đổi mật khẩu thất bại.';
            setPwdMsg({ type: 'error', text: errorMsg });
        } finally {
            setPwdLoading(false);
        }
    };

    if (!user) return <div style={{ padding: '50px', textAlign: 'center' }}>Vui lòng đăng nhập...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Quản lý tài khoản</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Cập nhật thông tin */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '20px', color: '#10b981', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Thông tin cá nhân</h3>
                    
                    {msg.text && (
                        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', background: msg.type === 'error' ? '#fee2e2' : '#d1fae5', color: msg.type === 'error' ? '#ef4444' : '#10b981' }}>
                            {msg.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email (Cố định)</label>
                            <input type="text" value={user.email} disabled style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Họ và Tên</label>
                            <input 
                                type="text" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }} 
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Số điện thoại</label>
                            <input 
                                type="tel" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }} 
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                    </form>
                </div>

                {/* Đổi mật khẩu */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '20px', color: '#f59e0b', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Đổi Mật Khẩu</h3>
                    
                    {pwdMsg.text && (
                        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', background: pwdMsg.type === 'error' ? '#fee2e2' : '#d1fae5', color: pwdMsg.type === 'error' ? '#ef4444' : '#10b981' }}>
                            {pwdMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mật khẩu hiện tại</label>
                            <input 
                                type="password" 
                                value={oldPassword} 
                                onChange={(e) => setOldPassword(e.target.value)} 
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }} 
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mật khẩu mới</label>
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }} 
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Xác nhận mật khẩu mới</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }} 
                            />
                        </div>
                        <button type="submit" disabled={pwdLoading} style={{ width: '100%', padding: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {pwdLoading ? 'Đang đổi...' : 'Đổi Mật Khẩu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
