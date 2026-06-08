import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import apiService, { API_ENDPOINTS } from '../../services/apiService';
import { formatMoney } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isResModalOpen, setIsResModalOpen] = useState(false);
    const [resForm, setResForm] = useState({ name: '', description: '', address: '', phoneNumber: '', ownerId: '', status: 'OPEN' });

    const [isDishModalOpen, setIsDishModalOpen] = useState(false);
    const [editingDish, setEditingDish] = useState(null);
    const [dishForm, setDishForm] = useState({ name: '', description: '', price: '', category: 'Thức ăn', imageUrl: '', isAvailable: true });
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'RESTAURANT') {
            navigate('/');
            return;
        }
        fetchMyRestaurant();
    }, [user, navigate]);

    const fetchMyRestaurant = async () => {
        setLoading(true);
        try {
            const res = await apiService.get(`${API_ENDPOINTS.RESTAURANT}/owner/${user.userId}`);
            setRestaurant(res.data);
            fetchMenu(res.data.id);
        } catch (err) {
            // Chưa có nhà hàng
            setRestaurant(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchMenu = async (resId) => {
        try {
            const res = await apiService.get(`${API_ENDPOINTS.RESTAURANT}/${resId}/menu`);
            setMenu(res.data || []);
        } catch (err) {
            console.error("Lỗi lấy menu", err);
        }
    };

    // --- Nhà Hàng ---
    const openResModal = () => {
        if (restaurant) {
            setResForm({ name: restaurant.name, description: restaurant.description || '', address: restaurant.address, phoneNumber: restaurant.phoneNumber, ownerId: user.userId, status: restaurant.status || 'OPEN' });
        } else {
            setResForm({ name: '', description: '', address: '', phoneNumber: '', ownerId: user.userId, status: 'OPEN' });
        }
        setIsResModalOpen(true);
    };

    const saveRestaurant = async (e) => {
        e.preventDefault();
        try {
            if (restaurant) {
                await apiService.put(`${API_ENDPOINTS.RESTAURANT}/${restaurant.id}`, resForm);
                alert("Cập nhật thông tin thành công!");
            } else {
                await apiService.post(API_ENDPOINTS.RESTAURANT, resForm);
                alert("Đăng ký nhà hàng thành công!");
            }
            setIsResModalOpen(false);
            fetchMyRestaurant();
        } catch (err) {
            alert("Lỗi lưu thông tin nhà hàng!");
        }
    };

    // --- Món Ăn ---
    const openDishModal = (dish = null) => {
        setEditingDish(dish);
        if (dish) {
            setDishForm({ name: dish.name, description: dish.description || '', price: dish.price, category: dish.category || 'Thức ăn', imageUrl: dish.imageUrl || '', isAvailable: dish.isAvailable });
        } else {
            setDishForm({ name: '', description: '', price: '', category: 'Thức ăn', imageUrl: '', isAvailable: true });
        }
        setIsDishModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploadingImage(true);
        try {
            const res = await apiService.post(`${API_ENDPOINTS.RESTAURANT}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.url) {
                setDishForm({ ...dishForm, imageUrl: res.data.url });
            }
        } catch (err) {
            alert("Lỗi upload ảnh!");
        } finally {
            setUploadingImage(false);
        }
    };

    const saveDish = async (e) => {
        e.preventDefault();
        try {
            if (editingDish) {
                await apiService.put(`${API_ENDPOINTS.RESTAURANT}/dishes/${editingDish.id}`, dishForm);
            } else {
                await apiService.post(`${API_ENDPOINTS.RESTAURANT}/${restaurant.id}/dishes`, dishForm);
            }
            setIsDishModalOpen(false);
            fetchMenu(restaurant.id);
        } catch (err) {
            alert("Lỗi lưu món ăn!");
        }
    };

    const deleteDish = async (dishId) => {
        if (!window.confirm("Bạn có chắc muốn xóa món ăn này?")) return;
        try {
            await apiService.delete(`${API_ENDPOINTS.RESTAURANT}/dishes/${dishId}`);
            setMenu(menu.filter(d => d.id !== dishId));
        } catch (err) {
            alert("Lỗi xóa món ăn!");
        }
    };

    if (!user || user.role !== 'RESTAURANT') return null;

    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải dữ liệu quán của bạn...</div>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <div style={{ width: '250px', background: '#1e293b', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#f59e0b', borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px' }}>Đối tác Nhà Hàng</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1' }}>
                    <div style={{ background: '#3b82f6', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🏪 Quản lý Quán & Menu</div>
                </nav>
                <button onClick={logout} style={{ padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Đăng xuất</button>
            </div>

            <div style={{ flex: '1', padding: '30px', overflowY: 'auto' }}>
                {!restaurant ? (
                    <div style={{ background: '#fff', padding: '40px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ color: '#333', marginBottom: '10px' }}>Bạn chưa đăng ký thông tin quán!</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Hãy cung cấp thông tin quán để bắt đầu kinh doanh trên hệ thống.</p>
                        <button onClick={openResModal} style={{ padding: '12px 25px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>Bắt đầu đăng ký</button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div>
                                <h2 style={{ color: '#0f172a', margin: 0 }}>{restaurant.name}</h2>
                                <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>📍 {restaurant.address} - 📞 {restaurant.phoneNumber}</p>
                                <span style={{ display: 'inline-block', marginTop: '10px', padding: '4px 10px', background: restaurant.status === 'OPEN' ? '#d1fae5' : '#fee2e2', color: restaurant.status === 'OPEN' ? '#059669' : '#dc2626', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                    {restaurant.status === 'OPEN' ? 'Đang mở cửa' : 'Tạm nghỉ'}
                                </span>
                            </div>
                            <button onClick={openResModal} style={{ padding: '10px 20px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>✏️ Cập nhật thông tin</button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: '#333' }}>Thực Đơn (Menu)</h2>
                            <button onClick={() => openDishModal()} style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>+ Thêm món mới</button>
                        </div>

                        <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Hình ảnh</th>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Tên Món</th>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Giá</th>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Tình trạng</th>
                                        <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menu.map(d => (
                                        <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px 15px' }}><img src={d.imageUrl || 'https://via.placeholder.com/50'} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} alt={d.name} /></td>
                                            <td style={{ padding: '15px', fontWeight: 'bold' }}>{d.name}<br/><span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>{d.category}</span></td>
                                            <td style={{ padding: '15px', color: '#e67e22', fontWeight: 'bold' }}>{formatMoney(d.price)}</td>
                                            <td style={{ padding: '15px' }}>{d.isAvailable ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>Còn hàng</span> : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Hết hàng</span>}</td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                <button onClick={() => openDishModal(d)} style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Sửa</button>
                                                <button onClick={() => deleteDish(d.id)} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {menu.length === 0 && <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Quán của bạn chưa có món ăn nào. Hãy thêm món nhé!</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* RESTAURANT MODAL */}
            {isResModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '400px' }}>
                        <h3>{restaurant ? 'Cập nhật thông tin Quán' : 'Đăng ký Quán'}</h3>
                        <form onSubmit={saveRestaurant}>
                            <input type="text" placeholder="Tên quán" value={resForm.name} onChange={e=>setResForm({...resForm, name: e.target.value})} required style={inputStyle} />
                            <input type="text" placeholder="Địa chỉ" value={resForm.address} onChange={e=>setResForm({...resForm, address: e.target.value})} required style={inputStyle} />
                            <input type="text" placeholder="Số điện thoại" value={resForm.phoneNumber} onChange={e=>setResForm({...resForm, phoneNumber: e.target.value})} required style={inputStyle} />
                            {restaurant && (
                                <select value={resForm.status} onChange={e=>setResForm({...resForm, status: e.target.value})} style={inputStyle}>
                                    <option value="OPEN">Mở cửa (OPEN)</option>
                                    <option value="CLOSED">Tạm nghỉ (CLOSED)</option>
                                </select>
                            )}
                            <textarea placeholder="Mô tả" value={resForm.description} onChange={e=>setResForm({...resForm, description: e.target.value})} style={{...inputStyle, height: '80px'}} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', flex: 1 }}>Lưu</button>
                                <button type="button" onClick={() => setIsResModalOpen(false)} style={{ padding: '10px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', flex: 1 }}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DISH MODAL */}
            {isDishModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '400px' }}>
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
                                    </div>
                                </div>
                                {uploadingImage && <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '5px' }}>Đang tải ảnh lên...</div>}
                            </div>

                            <textarea placeholder="Mô tả" value={dishForm.description} onChange={e=>setDishForm({...dishForm, description: e.target.value})} style={{...inputStyle, height: '60px'}} />
                            <label style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <input type="checkbox" checked={dishForm.isAvailable} onChange={e=>setDishForm({...dishForm, isAvailable: e.target.checked})} /> Còn hàng
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', flex: 1 }}>Lưu Món</button>
                                <button type="button" onClick={() => setIsDishModalOpen(false)} style={{ padding: '10px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', flex: 1 }}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', outline: 'none'
};

export default OwnerDashboard;
