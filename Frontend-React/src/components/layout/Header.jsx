import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';

const Header = () => {
    const { user, logout, checkAuth } = useContext(AuthContext);
    const { cartTotalItems, toggleCart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            navigate(`/?search=${encodeURIComponent(query)}`);
        }
    };

    const handleOrderClick = (e) => {
        e.preventDefault();
        if (checkAuth()) {
            if (user.role === "ADMIN") {
                navigate('/admin/orders');
            } else {
                navigate('/customer/orders');
            }
        }
    };

    return (
        <header>
            <div className="header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', maxWidth: '1400px', margin: '0 auto' }}>
                <Link to="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <div>
                        <img 
                            src="https://raw.githubusercontent.com/dinhquycoder2k5/DataStoreInHere/refs/heads/main/assets/Gemini_Generated_Image_5vxokj5vxokj5vxo.png" 
                            alt="FoodHub Logo" 
                            style={{ height: '45px', width: '45px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                    </div>
                    FastFood
                </Link>

                <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', whiteSpace: 'nowrap' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#fff', fontWeight: 'bold' }}>Trang chủ</Link>
                    <a href="/#menu" style={{ textDecoration: 'none', color: '#fff', fontWeight: 'bold' }}>Thực đơn</a>
                    
                    <div className="search-box" style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '20px', overflow: 'hidden', padding: '1px', border: '1px solid #ddd' }}>
                        <input 
                            type="text" 
                            placeholder="Tìm món ăn..." 
                            onKeyDown={handleSearch} 
                            style={{ border: 'none', padding: '5px 15px', outline: 'none', width: '200px' }}
                        />
                        <button style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Tìm kiếm</button>
                    </div>

                    <a href="#!" className="cart-btn" onClick={(e) => { e.preventDefault(); toggleCart(); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
                        🛒 Giỏ hàng
                        <span className="cart-count" style={{ background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '50%', fontSize: '0.8rem' }}>{cartTotalItems}</span>
                    </a>

                    <Link to="/customer/orders" className="orders-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>📦 Đơn Hàng</Link>
                    
                    {user ? (
                        <div className="user-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                            <span style={{ cursor: 'pointer', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', color: '#fff' }}>
                                👤 {user.email.split('@')[0]} ▾
                            </span>
                            <div className="dropdown-content">
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin">⚙️ Quản trị hệ thống</Link>
                                )}
                                <Link to="/customer/profile">📝 Thông tin khách hàng</Link>
                                <a href="#!" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Đăng xuất</a>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn" style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>🔐 Đăng nhập</Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
