import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import apiService, { API_ENDPOINTS } from '../../services/apiService';
import { formatMoney } from '../../utils/format';
import { Link } from 'react-router-dom';

const Orders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await apiService.get(`${API_ENDPOINTS.ORDER}/user/${user.userId}`);
            // Backend might return latest orders at the end, so reverse it to show newest first
            setOrders(res.data.reverse());
        } catch (err) {
            console.error("Lỗi khi tải danh sách đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'PENDING': return <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Chờ xác nhận</span>;
            case 'PAID': return <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Đã thanh toán</span>;
            case 'DELIVERING': return <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Đang giao</span>;
            case 'COMPLETED': return <span style={{ color: '#10b981', fontWeight: 'bold' }}>Hoàn thành</span>;
            case 'CANCELLED': return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Đã hủy</span>;
            default: return <span style={{ color: '#666' }}>{status}</span>;
        }
    };

    if (!user) return <div style={{ padding: '50px', textAlign: 'center' }}>Vui lòng đăng nhập...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#333' }}>Lịch Sử Đơn Hàng</h2>
                <Link to="/" style={{ textDecoration: 'none', color: '#10b981', fontWeight: 'bold' }}>← Tiếp tục mua sắm</Link>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Đang tải đơn hàng...</div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '15px' }}>Bạn chưa có đơn hàng nào.</p>
                    <Link to="/" style={{ padding: '10px 20px', background: '#e67e22', color: '#fff', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Đặt món ngay</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Mã đơn: #{order.id}</span>
                                    <span style={{ color: '#888', marginLeft: '15px', fontSize: '0.9rem' }}>{new Date(order.orderDate).toLocaleString('vi-VN')}</span>
                                </div>
                                <div>{getStatusText(order.status)}</div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ margin: '0 0 5px 0', color: '#555' }}><strong>Giao đến:</strong> {order.deliveryAddress}</p>
                                <p style={{ margin: '0', color: '#555' }}><strong>Nhà hàng:</strong> #{order.restaurantId}</p>
                            </div>

                            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Chi tiết món ăn:</h4>
                                {order.items && order.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#555' }}>
                                        <span>• Món #{item.dishId} x {item.quantity}</span>
                                        <span>{formatMoney(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', fontSize: '1.2rem' }}>
                                <span>Tổng tiền: <strong style={{ color: '#e67e22' }}>{formatMoney(order.totalAmount)}</strong></span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
