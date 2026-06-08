import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import apiService, { API_ENDPOINTS } from '../../services/apiService';
import { formatMoney } from '../../utils/format';

const Checkout = () => {
    const { cart, clearCart, cartTotalPrice } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Address State
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [street, setStreet] = useState('');

    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            // Fetch Vietnam API for Address
            fetch('https://provinces.open-api.vn/api/?depth=3')
                .then(res => res.json())
                .then(data => setProvinces(data))
                .catch(err => console.error("Error fetching provinces", err));
        }
    }, [user, navigate]);

    const handleProvinceChange = (e) => {
        const pCode = e.target.value;
        setSelectedProvince(pCode);
        const p = provinces.find(x => x.code == pCode);
        setDistricts(p ? p.districts : []);
        setWards([]);
        setSelectedDistrict('');
        setSelectedWard('');
    };

    const handleDistrictChange = (e) => {
        const dCode = e.target.value;
        setSelectedDistrict(dCode);
        const d = districts.find(x => x.code == dCode);
        setWards(d ? d.wards : []);
        setSelectedWard('');
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            setError("Giỏ hàng của bạn đang trống!");
            return;
        }

        if (!selectedProvince || !selectedDistrict || !selectedWard || !street.trim()) {
            setError("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã và Số nhà!");
            return;
        }

        const pName = provinces.find(x => x.code == selectedProvince)?.name || '';
        const dName = districts.find(x => x.code == selectedDistrict)?.name || '';
        const wName = wards.find(x => x.code == selectedWard)?.name || '';
        const fullAddress = `${street}, ${wName}, ${dName}, ${pName}`;

        setLoading(true);
        setError('');

        try {
            // Đảm bảo Customer record tồn tại trước khi đặt hàng
            try {
                await apiService.get(`${API_ENDPOINTS.CUSTOMER}/${user.userId}`);
            } catch (custErr) {
                if (custErr.response && (custErr.response.status === 404 || custErr.response.status === 500)) {
                    await apiService.post(API_ENDPOINTS.CUSTOMER, {
                        userId: user.userId,
                        fullname: user.email.split('@')[0],
                        email: user.email,
                        phoneNumber: '0999999999' // placeholder
                    });
                }
            }

            const groupedByRestaurant = cart.reduce((acc, item) => {
                if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
                acc[item.restaurantId].push(item);
                return acc;
            }, {});

            const resIds = Object.keys(groupedByRestaurant);
            
            if (paymentMethod === 'VNPAY' && resIds.length > 1) {
                setError("Thanh toán VNPay hiện chỉ hỗ trợ đơn hàng từ 1 nhà hàng cùng lúc. Vui lòng tách đơn hoặc chọn Thanh toán khi nhận hàng (COD).");
                setLoading(false);
                return;
            }

            let firstOrderId = null;

            for (const resId of resIds) {
                const items = groupedByRestaurant[resId];
                const orderPayload = {
                    userId: user.userId,
                    restaurantId: parseInt(resId),
                    deliveryAddress: fullAddress + (note ? ` (Ghi chú: ${note})` : ''),
                    items: items.map(i => ({ dishId: i.id, quantity: i.quantity }))
                };

                const orderRes = await apiService.post(API_ENDPOINTS.ORDER, orderPayload);
                if (!firstOrderId && orderRes.data && orderRes.data.id) {
                    firstOrderId = orderRes.data.id;
                }
            }

            if (paymentMethod === 'VNPAY' && firstOrderId) {
                // Gọi sang Payment Service
                const paymentRes = await apiService.post(`${API_ENDPOINTS.PAYMENT}/create?amount=${cartTotalPrice}&orderId=${firstOrderId}`);
                if (paymentRes.data && paymentRes.data.paymentUrl) {
                    clearCart();
                    window.location.href = paymentRes.data.paymentUrl;
                    return; // Stop execution, browser redirects to VNPAY
                } else {
                    setError("Lỗi tạo link thanh toán VNPay. Vui lòng thử lại!");
                    setLoading(false);
                    return;
                }
            }

            // Thanh toán COD thành công
            clearCart();
            alert("Đặt hàng thành công! Vui lòng chờ nhà hàng xác nhận.");
            navigate('/customer/orders');

        } catch (err) {
            const errMsg = err.response?.data?.message || err.response?.data?.error || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!";
            setError("Lỗi: " + errMsg);
            console.error("Order error:", err.response || err);
        } finally {
            if (paymentMethod !== 'VNPAY') setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 600px', background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginBottom: '25px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Thông tin Giao Hàng</h2>
                
                {error && <div style={{ padding: '10px', background: '#fee2e2', color: '#ef4444', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}

                <form onSubmit={handleCheckout}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Họ và Tên người nhận</label>
                        <input type="text" defaultValue={user.email.split('@')[0]} required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tỉnh / Thành phố</label>
                            <select value={selectedProvince} onChange={handleProvinceChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}>
                                <option value="">-- Chọn Tỉnh / Thành phố --</option>
                                {provinces.map(p => (
                                    <option key={p.code} value={p.code}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quận / Huyện</label>
                            <select value={selectedDistrict} onChange={handleDistrictChange} required disabled={!selectedProvince} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}>
                                <option value="">-- Chọn Quận / Huyện --</option>
                                {districts.map(d => (
                                    <option key={d.code} value={d.code}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phường / Xã</label>
                            <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required disabled={!selectedDistrict} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}>
                                <option value="">-- Chọn Phường / Xã --</option>
                                {wards.map(w => (
                                    <option key={w.code} value={w.code}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Số nhà, Tên đường</label>
                            <input 
                                type="text" 
                                value={street} 
                                onChange={(e) => setStreet(e.target.value)} 
                                placeholder="VD: 123 Đường ABC..."
                                required 
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }} 
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ghi chú cho tài xế/nhà hàng (Tùy chọn)</label>
                        <textarea 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="VD: Không hành, không cay..." 
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '80px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '25px', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', fontSize: '1.1rem' }}>Phương thức thanh toán</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', background: paymentMethod === 'COD' ? '#e8f5e9' : '#fff', border: '1px solid', borderColor: paymentMethod === 'COD' ? '#4caf50' : '#ddd', borderRadius: '8px' }}>
                                <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ transform: 'scale(1.2)' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>Thanh toán khi nhận hàng (COD)</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Thanh toán bằng tiền mặt khi tài xế giao hàng</div>
                                </div>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', background: paymentMethod === 'VNPAY' ? '#e3f2fd' : '#fff', border: '1px solid', borderColor: paymentMethod === 'VNPAY' ? '#2196f3' : '#ddd', borderRadius: '8px' }}>
                                <input type="radio" name="payment" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} style={{ transform: 'scale(1.2)' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>Thanh toán VNPAY (ATM/Visa/MasterCard)</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Bảo mật & Nhanh chóng qua cổng VNPAY</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || cart.length === 0}
                        style={{ width: '100%', padding: '15px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {loading ? 'Đang xử lý...' : `ĐẶT HÀNG TỔNG CỘNG: ${formatMoney(cartTotalPrice)}`}
                    </button>
                </form>
            </div>

            <div style={{ flex: '1 1 400px', background: '#f9f9f9', padding: '30px', borderRadius: '10px', border: '1px solid #eee', alignSelf: 'flex-start' }}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Tóm tắt đơn hàng ({cart.length} món)</h3>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '15px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                            <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                            <div style={{ flex: '1' }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#333' }}>{item.name}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                                    <span>{formatMoney(item.price)} x {item.quantity}</span>
                                    <span style={{ fontWeight: 'bold', color: '#e67e22' }}>{formatMoney(item.price * item.quantity)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: '2px dashed #ddd', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                        <span>Tạm tính:</span>
                        <span>{formatMoney(cartTotalPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                        <span>Phí giao hàng:</span>
                        <span>Miễn phí</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>
                        <span>Tổng cộng:</span>
                        <span style={{ color: '#e67e22' }}>{formatMoney(cartTotalPrice)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
