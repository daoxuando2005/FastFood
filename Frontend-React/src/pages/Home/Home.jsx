import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiService, { API_ENDPOINTS } from '../../services/apiService';
import { CartContext } from '../../contexts/CartContext';
import { formatMoney } from '../../utils/format';

const Home = () => {
    const [allDishes, setAllDishes] = useState([]);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [restaurants, setRestaurants] = useState(new Map());
    
    const [currentCategory, setCurrentCategory] = useState('all');
    const [currentRestaurant, setCurrentRestaurant] = useState('all');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { addToCart } = useContext(CartContext);
    
    // Spinner State
    const [spinnerDish, setSpinnerDish] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState(null);

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);
    const bannerImages = [
        "/images/products/snacks.jpg",
        "/images/products/fanta.jpg",
        "/images/products/pepsi.jpg"
    ];

    const location = useLocation();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
        }, 3000); // Đổi ảnh mỗi 3 giây
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadMenu();
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('search')?.toLowerCase() || '';
        
        let result = allDishes;
        
        if (currentCategory !== 'all') {
            result = result.filter(d => d.category?.trim() === currentCategory);
        }
        if (currentRestaurant !== 'all') {
            result = result.filter(d => d.restaurantId.toString() === currentRestaurant);
        }
        if (query) {
            result = result.filter(d => 
                d.name.toLowerCase().includes(query) || 
                d.restaurantName.toLowerCase().includes(query)
            );
        }
        
        setFilteredDishes(result);
    }, [allDishes, currentCategory, currentRestaurant, location.search]);

    const loadMenu = async () => {
        try {
            setLoading(true);
            const resData = await apiService.get(API_ENDPOINTS.RESTAURANT);
            const restaurantList = resData.data;
            
            let fetchedDishes = [];
            const catSet = new Set();
            const resMap = new Map();

            await Promise.all(restaurantList.map(async (res) => {
                try {
                    const menuData = await apiService.get(`${API_ENDPOINTS.RESTAURANT}/${res.id}/menu`);
                    if (menuData.data) {
                        const dishesWithInfo = menuData.data.map(d => {
                            if (d.category?.trim()) catSet.add(d.category.trim());
                            resMap.set(res.id, res.name);
                            return {
                                ...d,
                                restaurantId: res.id,
                                restaurantName: res.name
                            };
                        });
                        fetchedDishes = fetchedDishes.concat(dishesWithInfo);
                    }
                } catch (err) {
                    console.warn(`Lỗi tải menu nhà hàng ${res.id}`);
                }
            }));

            setAllDishes(fetchedDishes);
            setCategories(Array.from(catSet));
            setRestaurants(resMap);
            setSpinnerDish(fetchedDishes[0]);
            
        } catch (err) {
            setError(err.message || 'Lỗi kết nối tới server.');
        } finally {
            setLoading(false);
        }
    };

    const spinRandomFood = () => {
        if (allDishes.length === 0) {
            alert("Chưa có món ăn nào để quay!");
            return;
        }
        setIsSpinning(true);
        setSpinResult(null);

        let counter = 0;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * allDishes.length);
            setSpinnerDish(allDishes[randomIndex]);
            counter++;
            if (counter > 20) {
                clearInterval(interval);
                setIsSpinning(false);
                setSpinResult(allDishes[randomIndex]);
            }
        }, 100);
    };

    const cancelSpin = () => {
        setSpinResult(null);
    };

    return (
        <div>
            {/* Top Banner & Spinner */}
            <section className="top-banner-section" style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 20px' }}>
                <div style={{ display: 'flex', gap: '20px', height: '350px' }}>
                    <div className="carousel-container" style={{ flex: 2, borderRadius: '10px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', background: '#000' }}>
                        {bannerImages.map((img, index) => (
                            <div 
                                key={index}
                                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`} 
                                style={{ 
                                    backgroundImage: `url('${img}')`,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    opacity: index === currentSlide ? 1 : 0,
                                    transition: 'opacity 0.8s ease-in-out'
                                }}
                            ></div>
                        ))}
                        
                        {/* Indicators */}
                        <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                            {bannerImages.map((_, index) => (
                                <div 
                                    key={index} 
                                    style={{ 
                                        width: '10px', height: '10px', borderRadius: '50%', 
                                        background: index === currentSlide ? '#10b981' : 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer', transition: 'background 0.3s'
                                    }}
                                    onClick={() => setCurrentSlide(index)}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="spinner-container" style={{ flex: 1, background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                        <h3 style={{ color: '#10b981', marginBottom: '15px' }}>🎲 Hôm nay ăn gì?</h3>
                        
                        <div className={`spinner-wheel ${isSpinning ? 'spinning' : ''}`} style={{ width: '150px', height: '150px', borderRadius: '50%', border: '5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', marginBottom: '20px', transition: 'all 0.3s', background: '#f8f9fa' }}>
                            <img src={spinnerDish?.imageUrl || 'https://via.placeholder.com/150'} alt="Món ăn" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        
                        {spinResult && (
                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ color: '#333', marginBottom: '5px' }}>{spinResult.name}</h4>
                                <p style={{ color: '#10b981', fontWeight: 'bold' }}>{formatMoney(spinResult.price)}</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                            <button className="btn btn-primary" style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={spinRandomFood}>Quay ngẫu nhiên</button>
                            {spinResult && (
                                <button className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#333', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={cancelSpin}>Hủy</button>
                            )}
                        </div>
                        {spinResult && (
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px', background: '#f59e0b', padding: '10px', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={() => addToCart(spinResult)}>🛒 Thêm vào giỏ</button>
                        )}
                    </div>
                </div>
            </section>

            {/* Menu Section */}
            <section className="menu-section" id="menu" style={{ display: 'flex', gap: '30px', maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                <aside style={{ width: '250px', flexShrink: 0 }}>
                    <h3 style={{ marginBottom: '15px', borderBottom: '2px solid #10b981', paddingBottom: '5px' }}>🍽️ Danh mục</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                        <button 
                            className={`category-btn ${currentCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setCurrentCategory('all')}
                            style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '5px', border: '1px solid', borderColor: currentCategory === 'all' ? '#10b981' : '#ddd', background: '#fff', cursor: 'pointer', color: currentCategory === 'all' ? '#10b981' : '#333', fontWeight: currentCategory === 'all' ? 'bold' : 'normal' }}
                        >Tất cả</button>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                className={`category-btn ${currentCategory === cat ? 'active' : ''}`}
                                onClick={() => setCurrentCategory(cat)}
                                style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '5px', border: '1px solid', borderColor: currentCategory === cat ? '#10b981' : '#ddd', background: '#fff', cursor: 'pointer', color: currentCategory === cat ? '#10b981' : '#333', fontWeight: currentCategory === cat ? 'bold' : 'normal' }}
                            >{cat}</button>
                        ))}
                    </div>

                    <h3 style={{ marginBottom: '15px', borderBottom: '2px solid #10b981', paddingBottom: '5px' }}>🏪 Nhà hàng</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button 
                            className={`restaurant-btn ${currentRestaurant === 'all' ? 'active' : ''}`}
                            onClick={() => setCurrentRestaurant('all')}
                            style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '5px', border: '1px solid', borderColor: currentRestaurant === 'all' ? '#10b981' : '#ddd', background: '#fff', cursor: 'pointer', color: currentRestaurant === 'all' ? '#10b981' : '#333', fontWeight: currentRestaurant === 'all' ? 'bold' : 'normal' }}
                        >Tất cả</button>
                        {Array.from(restaurants.entries()).map(([id, name]) => (
                            <button 
                                key={id} 
                                className={`restaurant-btn ${currentRestaurant === id.toString() ? 'active' : ''}`}
                                onClick={() => setCurrentRestaurant(id.toString())}
                                style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '5px', border: '1px solid', borderColor: currentRestaurant === id.toString() ? '#10b981' : '#ddd', background: '#fff', cursor: 'pointer', color: currentRestaurant === id.toString() ? '#10b981' : '#333', fontWeight: currentRestaurant === id.toString() ? 'bold' : 'normal' }}
                            >{name}</button>
                        ))}
                    </div>
                </aside>

                <div style={{ flexGrow: 1 }}>
                    <h2 style={{ marginBottom: '20px' }}>🔥 Món ăn phổ biến</h2>
                    
                    <div className="menu-grid" id="menuGrid">
                        {loading && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                                <div className="loader"></div>
                                <p style={{ marginTop: '10px', color: '#666' }}>Đang kết nối tới Restaurant Service...</p>
                            </div>
                        )}
                        
                        {error && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'red' }}>
                                <h3>⚠️ Lỗi kết nối</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        
                        {!loading && !error && filteredDishes.length === 0 && (
                            <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Không tìm thấy món ăn nào.</p>
                        )}

                        {!loading && !error && filteredDishes.map(item => (
                            <div className="menu-card" key={`${item.restaurantId}-${item.id}`}>
                                <Link to={`/detail/${item.restaurantId}/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <img src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Food'} alt={item.name} />
                                </Link>
                                <div className="menu-card-content">
                                    <div className="menu-card-header">
                                        <Link to={`/detail/${item.restaurantId}/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <h3 className="menu-card-title hover-underline">{item.name}</h3>
                                        </Link>
                                        <span className="menu-card-price">{formatMoney(item.price)}</span>
                                    </div>
                                    <div className="menu-card-restaurant">🏪 {item.restaurantName}</div>
                                    <p className="menu-card-desc">{item.description || 'Món ngon hấp dẫn'}</p>
                                    <button className="add-to-cart" onClick={() => addToCart(item)}>
                                        + Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
