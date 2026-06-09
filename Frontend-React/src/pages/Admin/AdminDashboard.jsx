import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import apiService, { API_ENDPOINTS } from '../../services/apiService';
import { formatMoney } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    // Data States
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [payments, setPayments] = useState([]);

    // Modal States
    const [isResModalOpen, setIsResModalOpen] = useState(false);
    const [editingRes, setEditingRes] = useState(null);
    
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [selectedResId, setSelectedResId] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

    const [isDishModalOpen, setIsDishModalOpen] = useState(false);
    const [editingDish, setEditingDish] = useState(null);

    // Forms
    const [resForm, setResForm] = useState({ name: '', description: '', address: '', phoneNumber: '', ownerId: '', status: 'OPEN' });
    const [dishForm, setDishForm] = useState({ name: '', description: '', price: '', category: '', imageUrl: '', isAvailable: true });
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchAllData();
    }, [user, navigate]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [ordersRes, customersRes, restaurantsRes, deliveriesRes, paymentsRes] = await Promise.all([
                apiService.get(API_ENDPOINTS.ORDER).catch(() => ({ data: [] })),
                apiService.get(API_ENDPOINTS.CUSTOMER).catch(() => ({ data: [] })),
                apiService.get(API_ENDPOINTS.RESTAURANT).catch(() => ({ data: [] })),
                apiService.get(API_ENDPOINTS.DELIVERY).catch(() => ({ data: [] })),
                apiService.get(`${API_ENDPOINTS.PAYMENT}/all`).catch(() => ({ data: [] }))
            ]);

            setOrders(Array.isArray(ordersRes.data) ? ordersRes.data.reverse() : []);
            setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
            setRestaurants(Array.isArray(restaurantsRes.data) ? restaurantsRes.data : []);
            setDeliveries(Array.isArray(deliveriesRes.data) ? deliveriesRes.data.reverse() : []);
            setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data.reverse() : []);
            
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu Admin:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Order Actions ---
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await apiService.put(`${API_ENDPOINTS.ORDER}/${orderId}/status?status=${newStatus}`);
            const res = await apiService.get(API_ENDPOINTS.ORDER);
            setOrders(Array.isArray(res.data) ? res.data.reverse() : []);
        } catch (err) {
            alert("Lỗi cập nhật trạng thái đơn hàng!");
        }
    };

    // --- Delivery Actions ---
    const handleUpdateDeliveryStatus = async (deliveryId, newStatus) => {
        try {
            await apiService.put(`${API_ENDPOINTS.DELIVERY}/${deliveryId}/status?status=${newStatus}`);
            const res = await apiService.get(API_ENDPOINTS.DELIVERY);
            setDeliveries(Array.isArray(res.data) ? res.data.reverse() : []);
        } catch (err) {
            alert("Lỗi cập nhật trạng thái giao hàng!");
        }
    };

    // --- Restaurant CRUD ---
    const openResModal = (res = null) => {
        setEditingRes(res);
        if (res) {
            setResForm({ name: res.name, description: res.description, address: res.address, phoneNumber: res.phoneNumber, ownerId: res.ownerId, status: res.status || 'OPEN' });
        } else {
            setResForm({ name: '', description: '', address: '', phoneNumber: '', ownerId: user.userId, status: 'OPEN' });
        }
        setIsResModalOpen(true);
    };

    const saveRestaurant = async (e) => {
        e.preventDefault();
        try {
            if (editingRes) {
                await apiService.put(`${API_ENDPOINTS.RESTAURANT}/${editingRes.id}`, resForm);
            } else {
                await apiService.post(API_ENDPOINTS.RESTAURANT, resForm);
            }
            setIsResModalOpen(false);
            const res = await apiService.get(API_ENDPOINTS.RESTAURANT);
            setRestaurants(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            alert("Lỗi lưu nhà hàng!");
        }
    };

    const deleteRestaurant = async (resId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đối tác nhà hàng này (Lưu ý: Bạn phải cấu hình API DELETE trên backend trước)?")) return;
        try {
            await apiService.delete(`${API_ENDPOINTS.RESTAURANT}/${resId}`);
            setRestaurants(restaurants.filter(r => r.id !== resId));
            alert("Đã xóa nhà hàng thành công!");
        } catch (err) {
            alert("Lỗi xóa nhà hàng! API DELETE chưa được hỗ trợ trên Backend hoặc có lỗi mạng.");
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản khách hàng này? Mọi địa chỉ liên quan cũng sẽ bị xóa.")) return;
        try {
            await apiService.delete(`${API_ENDPOINTS.CUSTOMER}/${customerId}`);
            setCustomers(customers.filter(c => c.userId !== customerId && c.id !== customerId));
            alert("Đã xóa khách hàng thành công!");
        } catch (err) {
            alert("Lỗi xóa khách hàng!");
        }
    };

    // --- Menu / Dish CRUD ---
    const openMenuModal = async (resId) => {
        setSelectedResId(resId);
        try {
            const res = await apiService.get(`${API_ENDPOINTS.RESTAURANT}/${resId}/menu`);
            setMenuItems(res.data || []);
            setIsMenuModalOpen(true);
        } catch (err) {
            alert("Lỗi tải menu!");
        }
    };

    const openDishModal = (dish = null) => {
        setEditingDish(dish);
        if (dish) {
            setDishForm({ name: dish.name, description: dish.description, price: dish.price, category: dish.category, imageUrl: dish.imageUrl || '', isAvailable: dish.isAvailable });
        } else {
            setDishForm({ name: '', description: '', price: '', category: 'Thức ăn', imageUrl: '', isAvailable: true });
        }
        setIsDishModalOpen(true);
    };

    const saveDish = async (e) => {
        e.preventDefault();
        try {
            if (editingDish) {
                await apiService.put(`${API_ENDPOINTS.RESTAURANT}/dishes/${editingDish.id}`, dishForm);
            } else {
                await apiService.post(`${API_ENDPOINTS.RESTAURANT}/${selectedResId}/dishes`, dishForm);
            }
            setIsDishModalOpen(false);
            // Refresh menu
            const res = await apiService.get(`${API_ENDPOINTS.RESTAURANT}/${selectedResId}/menu`);
            setMenuItems(res.data || []);
        } catch (err) {
            alert("Lỗi lưu món ăn!");
        }
    };

    const deleteDish = async (dishId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa món này?")) return;
        try {
            await apiService.delete(`${API_ENDPOINTS.RESTAURANT}/dishes/${dishId}`);
            setMenuItems(menuItems.filter(d => d.id !== dishId));
        } catch (err) {
            alert("Lỗi xóa món ăn!");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploadingImage(true);
        try {
            // Sử dụng axios trực tiếp qua apiService để giữ token (nếu cần)
            const res = await apiService.post(`${API_ENDPOINTS.RESTAURANT}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.url) {
                setDishForm({ ...dishForm, imageUrl: res.data.url });
            }
        } catch (err) {
            alert("Lỗi upload ảnh! Vui lòng thử lại.");
        } finally {
            setUploadingImage(false);
        }
    };

    // --- Render Helpers ---
    const getOrderStatusBadge = (status) => {
        switch(status) {
            case 'PENDING': return <span style={badgeStyle('#fef3c7', '#d97706')}>Chờ duyệt</span>;
            case 'CONFIRMED': return <span style={badgeStyle('#e0e7ff', '#4338ca')}>Đã duyệt</span>;
            case 'PAID': return <span style={badgeStyle('#dbeafe', '#1d4ed8')}>Đã thanh toán</span>;
            case 'DELIVERING': return <span style={badgeStyle('#f3e8ff', '#7e22ce')}>Đang giao</span>;
            case 'COMPLETED': return <span style={badgeStyle('#d1fae5', '#059669')}>Hoàn thành</span>;
            case 'CANCELLED': return <span style={badgeStyle('#fee2e2', '#dc2626')}>Đã hủy</span>;
            default: return <span>{status}</span>;
        }
    };

    const getDeliveryStatusBadge = (status) => {
        switch(status) {
            case 'ASSIGNED': return <span style={badgeStyle('#e0e7ff', '#4338ca')}>Đã nhận đơn</span>;
            case 'PICKED_UP': return <span style={badgeStyle('#fef3c7', '#d97706')}>Đã lấy hàng</span>;
            case 'DELIVERING': return <span style={badgeStyle('#f3e8ff', '#7e22ce')}>Đang giao</span>;
            case 'DELIVERED': return <span style={badgeStyle('#d1fae5', '#059669')}>Giao thành công</span>;
            case 'FAILED': return <span style={badgeStyle('#fee2e2', '#dc2626')}>Thất bại</span>;
            default: return <span>{status}</span>;
        }
    };

    const badgeStyle = (bg, color) => ({ background: bg, color: color, padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' });
    const btnStyle = (bg) => ({ padding: '6px 12px', background: bg, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' });

    // --- Tab Contents ---
    const renderDashboard = () => {
        const totalRevenue = orders.filter(o => o.status === 'COMPLETED' || o.status === 'PAID').reduce((sum, o) => sum + o.totalAmount, 0);
        const pendingCount = orders.filter(o => o.status === 'PENDING').length;

        const orderStatusData = [
            { name: 'Chờ duyệt', count: pendingCount },
            { name: 'Đang giao', count: orders.filter(o => o.status === 'DELIVERING').length },
            { name: 'Hoàn thành', count: orders.filter(o => o.status === 'COMPLETED').length },
            { name: 'Đã hủy', count: orders.filter(o => o.status === 'CANCELLED').length },
        ];

        const revenueByMonth = Array.from({ length: 12 }, (_, i) => ({ name: `T${i + 1}`, revenue: 0 }));
        orders.forEach(o => {
            if (o.status === 'COMPLETED' || o.status === 'PAID') {
                const date = new Date(o.createdAt || o.orderDate);
                const month = date.getMonth();
                if(month >= 0 && month <= 11) revenueByMonth[month].revenue += o.totalAmount;
            }
        });

        return (
            <div>
                <h2 style={{ color: '#333', marginBottom: '20px' }}>Tổng quan Hệ thống</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <StatCard title="Tổng Doanh Thu" value={formatMoney(totalRevenue)} color="#10b981" />
                    <StatCard title="Tổng Đơn Hàng" value={orders.length} color="#0f172a" />
                    <StatCard title="Đơn Chờ Duyệt" value={pendingCount} color="#f59e0b" />
                    <StatCard title="Tổng Khách Hàng" value={customers.length} color="#3b82f6" />
                    <StatCard title="Tổng Nhà Hàng" value={restaurants.length} color="#8b5cf6" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', height: '400px' }}>
                        <h3 style={{ color: '#333', marginBottom: '20px' }}>Biểu đồ trạng thái đơn hàng</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={orderStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" name="Số lượng đơn" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', height: '400px' }}>
                        <h3 style={{ color: '#333', marginBottom: '20px' }}>Doanh thu theo tháng (VNĐ)</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={revenueByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(val)} />
                                <Tooltip formatter={(val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)} />
                                <Legend />
                                <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderOrders = () => (
        <div>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Quản lý Đơn hàng</h2>
            <Table columns={['Mã Đơn', 'Ngày đặt', 'Khách hàng', 'Tổng Tiền', 'Trạng Thái', 'Hành Động']}>
                {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>#{order.id}</td>
                        <td style={{ padding: '15px' }}>{new Date(order.createdAt || order.orderDate).toLocaleString('vi-VN')}</td>
                        <td style={{ padding: '15px' }}>KH #{order.userId || order.customerId}</td>
                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#e67e22' }}>{formatMoney(order.totalAmount)}</td>
                        <td style={{ padding: '15px' }}>{getOrderStatusBadge(order.status)}</td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                            {order.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                    <button onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')} style={btnStyle('#3b82f6')}>Duyệt</button>
                                    <button onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')} style={btnStyle('#ef4444')}>Hủy</button>
                                </div>
                            )}
                            {(order.status === 'CONFIRMED' || order.status === 'PAID') && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERING')} style={btnStyle('#8b5cf6')}>Chuyển Giao Hàng</button>
                            )}
                            {order.status === 'DELIVERING' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')} style={btnStyle('#10b981')}>Hoàn thành</button>
                            )}
                        </td>
                    </tr>
                ))}
            </Table>
        </div>
    );

    const renderCustomers = () => (
        <div>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Danh sách Khách Hàng</h2>
            <Table columns={['ID', 'Họ Tên', 'Số điện thoại', 'Email', 'Hành Động']}>
                {customers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '15px' }}>#{c.id} (Auth: {c.userId})</td>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{c.fullname || 'Chưa cập nhật'}</td>
                        <td style={{ padding: '15px' }}>{c.phoneNumber || 'Chưa cập nhật'}</td>
                        <td style={{ padding: '15px' }}>{c.email}</td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                            <button onClick={() => handleDeleteCustomer(c.id)} style={btnStyle('#ef4444')}>Xóa Khách</button>
                        </td>
                    </tr>
                ))}
            </Table>
        </div>
    );

    const renderRestaurants = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ color: '#333' }}>Danh sách Đối tác Nhà Hàng</h2>
                <button onClick={() => openResModal()} style={btnStyle('#10b981')}>+ Thêm Nhà Hàng</button>
            </div>
            <Table columns={['Mã NH', 'Tên Nhà Hàng', 'Trạng thái', 'Địa chỉ', 'Số điện thoại', 'Hành Động']}>
                {restaurants.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>#{r.id}</td>
                        <td style={{ padding: '15px' }}>{r.name}</td>
                        <td style={{ padding: '15px' }}>
                            <span style={r.status === 'OPEN' ? badgeStyle('#d1fae5', '#059669') : badgeStyle('#fee2e2', '#dc2626')}>
                                {r.status === 'OPEN' ? 'Mở cửa' : 'Tạm nghỉ'}
                            </span>
                        </td>
                        <td style={{ padding: '15px' }}>{r.address}</td>
                        <td style={{ padding: '15px' }}>{r.phoneNumber}</td>
                        <td style={{ padding: '15px', textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                            <button onClick={() => openMenuModal(r.id)} style={btnStyle('#8b5cf6')}>Menu</button>
                            <button onClick={() => openResModal(r)} style={btnStyle('#f59e0b')}>Sửa</button>
                        </td>
                    </tr>
                ))}
            </Table>
        </div>
    );

    const renderDeliveries = () => (
        <div>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Theo dõi Giao Hàng</h2>
            <Table columns={['Mã Giao Hàng', 'Mã Đơn', 'Tài xế', 'Trạng Thái', 'Cập nhật']}>
                {deliveries.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>#{d.id}</td>
                        <td style={{ padding: '15px' }}>Order #{d.orderId}</td>
                        <td style={{ padding: '15px' }}>{d.driverName}</td>
                        <td style={{ padding: '15px' }}>{getDeliveryStatusBadge(d.status)}</td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                            {d.status === 'ASSIGNED' && <button onClick={() => handleUpdateDeliveryStatus(d.id, 'PICKED_UP')} style={btnStyle('#f59e0b')}>Đã lấy món</button>}
                            {d.status === 'PICKED_UP' && <button onClick={() => handleUpdateDeliveryStatus(d.id, 'DELIVERING')} style={btnStyle('#3b82f6')}>Bắt đầu giao</button>}
                            {d.status === 'DELIVERING' && <button onClick={() => handleUpdateDeliveryStatus(d.id, 'DELIVERED')} style={btnStyle('#10b981')}>Giao thành công</button>}
                        </td>
                    </tr>
                ))}
            </Table>
        </div>
    );

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
            <div style={{ width: '250px', background: '#1e293b', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#10b981', borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px' }}>System Admin</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1' }}>
                    <SidebarItem label="📊 Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem label="📦 Đơn hàng" isActive={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                    <SidebarItem label="🏪 Nhà hàng & Menu" isActive={activeTab === 'restaurants'} onClick={() => setActiveTab('restaurants')} />
                    <SidebarItem label="👥 Khách hàng" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                    <SidebarItem label="🚚 Giao hàng" isActive={activeTab === 'deliveries'} onClick={() => setActiveTab('deliveries')} />
                </nav>
                <button onClick={logout} style={{ padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Đăng xuất</button>
            </div>

            <div style={{ flex: '1', padding: '30px', overflowY: 'auto', position: 'relative' }}>
                {loading ? <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Đang đồng bộ dữ liệu hệ thống...</div> : (
                    <>
                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'orders' && renderOrders()}
                        {activeTab === 'customers' && renderCustomers()}
                        {activeTab === 'restaurants' && renderRestaurants()}
                        {activeTab === 'deliveries' && renderDeliveries()}
                    </>
                )}
            </div>

            {/* RESTAURANT MODAL */}
            {isResModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>{editingRes ? 'Sửa thông tin Nhà Hàng' : 'Thêm Nhà Hàng Mới'}</h3>
                        <form onSubmit={saveRestaurant}>
                            <input type="text" placeholder="Tên nhà hàng" value={resForm.name} onChange={e=>setResForm({...resForm, name: e.target.value})} required style={inputStyle} />
                            <input type="text" placeholder="Địa chỉ" value={resForm.address} onChange={e=>setResForm({...resForm, address: e.target.value})} required style={inputStyle} />
                            <input type="text" placeholder="Số điện thoại" value={resForm.phoneNumber} onChange={e=>setResForm({...resForm, phoneNumber: e.target.value})} required style={inputStyle} />
                            <select value={resForm.status} onChange={e=>setResForm({...resForm, status: e.target.value})} style={inputStyle}>
                                <option value="OPEN">Mở cửa (OPEN)</option>
                                <option value="CLOSED">Tạm nghỉ (CLOSED)</option>
                            </select>
                            <textarea placeholder="Mô tả" value={resForm.description} onChange={e=>setResForm({...resForm, description: e.target.value})} style={{...inputStyle, height: '80px'}} />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={btnStyle('#10b981')}>Lưu</button>
                                <button type="button" onClick={() => setIsResModalOpen(false)} style={btnStyle('#94a3b8')}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MENU MODAL */}
            {isMenuModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={{...modalContentStyle, width: '800px', maxWidth: '90%'}}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Quản lý Menu (Nhà hàng #{selectedResId})</h3>
                            <button onClick={() => setIsMenuModalOpen(false)} style={btnStyle('#ef4444')}>Đóng</button>
                        </div>
                        <button onClick={() => openDishModal()} style={{...btnStyle('#10b981'), marginBottom: '20px'}}>+ Thêm Món Ăn</button>
                        
                        <Table columns={['Hình', 'Tên Món', 'Giá', 'Hành Động']}>
                            {menuItems.map(d => (
                                <tr key={d.id}>
                                    <td style={{ padding: '10px' }}><img src={d.imageUrl || 'https://via.placeholder.com/50'} style={{ width: '50px', borderRadius: '5px' }} /></td>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{d.name}</td>
                                    <td style={{ padding: '10px', color: '#e67e22' }}>{formatMoney(d.price)}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                        <button onClick={() => openDishModal(d)} style={btnStyle('#3b82f6')}>Sửa</button>
                                        <button onClick={() => deleteDish(d.id)} style={btnStyle('#ef4444')}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>
            )}

            {/* DISH MODAL */}
            {isDishModalOpen && (
                <div style={{...modalOverlayStyle, zIndex: 1100}}>
                    <div style={modalContentStyle}>
                        <h3>{editingDish ? 'Sửa Món Ăn' : 'Thêm Món Ăn Mới'}</h3>
                        <form onSubmit={saveDish}>
                            <input type="text" placeholder="Tên món" value={dishForm.name} onChange={e=>setDishForm({...dishForm, name: e.target.value})} required style={inputStyle} />
                            <input type="number" placeholder="Giá tiền (VNĐ)" value={dishForm.price} onChange={e=>setDishForm({...dishForm, price: e.target.value})} required style={inputStyle} />
                            <input type="text" placeholder="Danh mục" value={dishForm.category} onChange={e=>setDishForm({...dishForm, category: e.target.value})} required style={inputStyle} />
                            
                            <div style={{ marginBottom: '15px', padding: '10px', background: '#f8fafc', borderRadius: '5px', border: '1px dashed #cbd5e1' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#64748b' }}>Ảnh món ăn:</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {dishForm.imageUrl && <img src={dishForm.imageUrl} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} />}
                                    <div style={{ flex: '1' }}>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '5px', width: '100%' }} />
                                        <input type="text" placeholder="Hoặc dán link ảnh vào đây" value={dishForm.imageUrl} onChange={e=>setDishForm({...dishForm, imageUrl: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }} />
                                    </div>
                                </div>
                                {uploadingImage && <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '5px' }}>Đang tải ảnh lên...</div>}
                            </div>

                            <textarea placeholder="Mô tả" value={dishForm.description} onChange={e=>setDishForm({...dishForm, description: e.target.value})} style={{...inputStyle, height: '60px'}} />
                            <label style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <input type="checkbox" checked={dishForm.isAvailable} onChange={e=>setDishForm({...dishForm, isAvailable: e.target.checked})} /> Còn hàng
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={btnStyle('#10b981')}>Lưu Món</button>
                                <button type="button" onClick={() => setIsDishModalOpen(false)} style={btnStyle('#94a3b8')}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Reusable UI Components & Styles ---

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
    background: '#fff', padding: '30px', borderRadius: '10px', width: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
};

const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', outline: 'none'
};

const SidebarItem = ({ label, isActive, onClick }) => (
    <div onClick={onClick} style={{ background: isActive ? '#3b82f6' : 'transparent', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', border: isActive ? 'none' : '1px solid #334155' }}>
        {label}
    </div>
);

const StatCard = ({ title, value, color }) => (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div style={{ color: '#64748b', marginBottom: '10px', fontWeight: 'bold' }}>{title}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>{value}</div>
    </div>
);

const Table = ({ columns, children }) => (
    <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead style={{ background: '#f8fafc' }}>
                <tr>
                    {columns.map((col, idx) => <th key={idx} style={{ padding: '15px', textAlign: idx === columns.length - 1 ? 'center' : 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>{col}</th>)}
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
    </div>
);

export default AdminDashboard;
