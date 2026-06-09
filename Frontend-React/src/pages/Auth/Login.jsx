import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import apiService, { API_ENDPOINTS } from '../../services/apiService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await apiService.post(API_ENDPOINTS.LOGIN, { email, password });
            if (res.data && res.data.token) {
                let role = res.data.role || "CUSTOMER";


                const userToSave = { ...res.data, role, email };
                login(userToSave);

                if (role === "ADMIN") {
                    navigate('/admin');
                } else if (role === "RESTAURANT") {
                    navigate('/restaurant-admin');
                } else {
                    navigate('/');
                }
            } else {
                setError("Đăng nhập thất bại, không nhận được token.");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#10b981' }}>Đăng Nhập</h2>
            {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
            
            <form onSubmit={handleLogin}>
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
                    {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Chưa có tài khoản? <Link to="/register" style={{ color: '#10b981', textDecoration: 'none' }}>Đăng ký ngay</Link>
            </p>
        </div>
    );
};

export default Login;
