import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import apiService, { API_ENDPOINTS } from '../../services/apiService';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await apiService.post(API_ENDPOINTS.REGISTER, { name, email, password });
            setSuccess("Đăng ký thành công! Đang tự động đăng nhập...");
            
            // Auto Login
            try {
                const res = await apiService.post(API_ENDPOINTS.LOGIN, { email, password });
                if (res.data && res.data.token) {
                    let role = res.data.role || "CUSTOMER";
                    login({ ...res.data, role, email });
                    
                    setTimeout(() => {
                        if (role === "ADMIN") navigate('/admin');
                        else navigate('/');
                    }, 1000);
                }
            } catch (loginErr) {
                setTimeout(() => navigate('/login'), 2000);
            }
            
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Đăng ký thất bại. Email có thể đã tồn tại!";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#10b981' }}>Đăng Ký Tài Khoản</h2>
            {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
            {success && <div style={{ background: '#d1fae5', color: '#10b981', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{success}</div>}
            
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Họ và Tên</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', outline: 'none' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', outline: 'none' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mật khẩu</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', outline: 'none' }}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                >
                    {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Đã có tài khoản? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none' }}>Đăng nhập</Link>
            </p>
        </div>
    );
};

export default Register;
