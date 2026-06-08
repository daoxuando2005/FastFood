import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import { formatMoney } from '../../utils/format';

const CartSidebar = () => {
    const { 
        cart, isCartOpen, toggleCart, closeCart, 
        changeQuantity, removeItem, cartTotalPrice 
    } = useContext(CartContext);
    
    const { checkAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert("Giỏ hàng đang trống!");
            return;
        }
        
        if (checkAuth()) {
            closeCart();
            navigate('/checkout');
        }
    };

    return (
        <>
            <div 
                className={`overlay ${isCartOpen ? 'active' : ''}`} 
                id="overlay" 
                onClick={closeCart}
            ></div>
            
            <div className={`cart-sidebar ${isCartOpen ? 'active' : ''}`} id="cartSidebar">
                <div className="cart-header">
                    <h2>Giỏ hàng của bạn</h2>
                    <button className="close-cart" onClick={toggleCart}>✕</button>
                </div>
                
                <div className="cart-items" id="cartItems">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <p>Giỏ hàng trống</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Thêm món ăn vào giỏ hàng nhé!</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div className="cart-item" key={index}>
                                <img src={item.imageUrl || 'https://via.placeholder.com/70'} alt={item.name} />
                                <div className="cart-info">
                                    <h4>{item.name}</h4>
                                    <p>{formatMoney(item.price)}</p>
                                    <div className="qty-control">
                                        <button className="qty-btn" onClick={() => changeQuantity(index, -1)}>-</button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => changeQuantity(index, 1)}>+</button>
                                    </div>
                                </div>
                                <button className="remove-btn" onClick={() => removeItem(index)}>Xóa</button>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="cart-total">
                        <span>Tổng cộng:</span><span>{formatMoney(cartTotalPrice)}</span>
                    </div>
                    <button className="checkout-btn" onClick={handleCheckout}>Đặt hàng ngay</button>
                </div>
            </div>
        </>
    );
};

export default CartSidebar;
