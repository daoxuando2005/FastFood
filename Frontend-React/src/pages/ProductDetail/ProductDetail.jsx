import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService, { API_ENDPOINTS } from '../../services/apiService';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import { formatMoney } from '../../utils/format';

const ProductDetail = () => {
    const { resId, dishId } = useParams();
    const navigate = useNavigate();
    
    const [dish, setDish] = useState(null);
    const [restaurantName, setRestaurantName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState('Vừa');

    const { addToCart, isCartOpen, toggleCart } = useContext(CartContext);
    const { checkAuth } = useContext(AuthContext);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                // Fetch restaurant to get name
                const resList = await apiService.get(API_ENDPOINTS.RESTAURANT);
                const currentRes = resList.data.find(r => r.id.toString() === resId);
                setRestaurantName(currentRes ? currentRes.name : "Nhà hàng không xác định");

                // Fetch menu to get dish details
                const menu = await apiService.get(`${API_ENDPOINTS.RESTAURANT}/${resId}/menu`);
                const currentDish = menu.data.find(d => d.id.toString() === dishId);

                if (currentDish) {
                    setDish({
                        ...currentDish,
                        restaurantId: resId,
                        restaurantName: currentRes ? currentRes.name : "Nhà hàng không xác định"
                    });
                } else {
                    setError("Sản phẩm không tồn tại hoặc đã bị xóa!");
                }
            } catch (err) {
                setError("Lỗi kết nối Server! Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        if (resId && dishId) {
            fetchDetail();
        } else {
            setError("Không tìm thấy thông tin sản phẩm!");
            setLoading(false);
        }
    }, [resId, dishId]);

    const updateQty = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleAddToCart = () => {
        if (!checkAuth()) return;
        addToCart(dish, quantity);
    };

    const handleBuyNow = () => {
        if (!checkAuth()) return;
        addToCart(dish, quantity);
        navigate('/checkout');
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><div className="loader"></div><p>Đang tải chi tiết sản phẩm...</p></div>;
    if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}><h2>{error}</h2><button onClick={() => navigate(-1)} className="btn">Quay lại</button></div>;
    if (!dish) return null;

    const imageUrl = dish.imageUrl || 'https://via.placeholder.com/600x600?text=Food';

    return (
        <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 20px' }}>
            <div className="product-page">
                <div className="product-left">
                    <div className="main-img-container">
                        <img src={imageUrl} alt={dish.name} className="main-img" />
                    </div>
                    <div className="thumbnail-list">
                        <div className="thumb-item active"><img src={imageUrl} alt="thumb" /></div>
                        <div className="thumb-item"><img src={imageUrl} alt="thumb" /></div>
                        <div className="thumb-item"><img src={imageUrl} alt="thumb" /></div>
                    </div>
                    <div className="social-share">
                        <span>Chia sẻ: 💙 💬 📌</span>
                        <span>|</span>
                        <span>❤️ Đã thích (239)</span>
                    </div>
                </div>
                
                <div className="product-right">
                    <h1 className="product-title">
                        <span className="badge-mall">Mall</span>{dish.name}
                    </h1>
                    
                    <div className="product-meta">
                        <span className="stars">★★★★★ 4.9</span>
                        <div className="meta-divider"></div>
                        <span>733 Đánh Giá</span>
                        <div className="meta-divider"></div>
                        <span>1.2k Đã Bán</span>
                    </div>
                    
                    <div className="product-price-box">
                        <span className="old-price">{formatMoney(dish.price * 1.2)}</span>
                        <span className="current-price">{formatMoney(dish.price)}</span>
                        <span className="discount-badge">Giảm 20%</span>
                    </div>
                    
                    <div className="info-row">
                        <div className="info-label">Vận Chuyển</div>
                        <div className="info-content" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            🚚 Miễn phí vận chuyển <br/>
                        </div>
                    </div>
                    
                    <div className="info-row">
                        <div className="info-label">Cửa hàng</div>
                        <div className="info-content">
                            🏪 {restaurantName}
                        </div>
                    </div>
                    
                    <div className="info-row">
                        <div className="info-label">Kích Cỡ (Size)</div>
                        <div className="info-content">
                            <button className={`variation-btn ${size === 'Vừa' ? 'active' : ''}`} onClick={() => setSize('Vừa')}>Vừa</button>
                            <button className={`variation-btn ${size === 'Lớn' ? 'active' : ''}`} onClick={() => setSize('Lớn')}>Lớn</button>
                            <button className={`variation-btn ${size === 'Khổng Lồ' ? 'active' : ''}`} onClick={() => setSize('Khổng Lồ')}>Khổng Lồ</button>
                        </div>
                    </div>
                    
                    <div className="info-row" style={{ marginTop: '30px' }}>
                        <div className="info-label">Số Lượng</div>
                        <div className="info-content">
                            <div className="qty-wrapper">
                                <button className="qty-btn" onClick={() => updateQty(-1)}>-</button>
                                <input type="number" className="qty-input" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                                <button className="qty-btn" onClick={() => updateQty(1)}>+</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="action-buttons">
                        <button className="btn-add-cart" onClick={handleAddToCart}>
                            🛒 Thêm Vào Giỏ Hàng
                        </button>
                        <button className="btn-buy-now" onClick={handleBuyNow}>
                            Mua Ngay
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Product Description */}
            <div style={{ marginTop: '40px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>CHI TIẾT SẢN PHẨM</h3>
                <p style={{ marginTop: '15px', lineHeight: '1.6', color: '#555' }}>
                    {dish.description && dish.description.trim() !== '' ? dish.description : 'Món ăn ngon và hấp dẫn, được chế biến từ các nguyên liệu tươi sạch. Đảm bảo giao hàng tận nơi nhanh chóng, giữ nguyên hương vị thơm ngon khi đến tay bạn!'}
                </p>
            </div>
        </div>
    );
};

export default ProductDetail;
