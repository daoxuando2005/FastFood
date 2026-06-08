import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { checkAuth } = useContext(AuthContext);

    useEffect(() => {
        const storedCart = localStorage.getItem('foodhub_cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    const saveCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('foodhub_cart', JSON.stringify(newCart));
    };

    const addToCart = (dish, qty = 1) => {
        if (!checkAuth()) return; // Require login

        const newCart = [...cart];
        const existingIndex = newCart.findIndex(item => item.id === dish.id);
        
        if (existingIndex >= 0) {
            newCart[existingIndex].quantity += qty;
        } else {
            newCart.push({ ...dish, quantity: qty });
        }
        
        saveCart(newCart);
        
        // Open cart for better UX
        if (!isCartOpen) setIsCartOpen(true);
    };

    const changeQuantity = (index, delta) => {
        const newCart = [...cart];
        if (newCart[index]) {
            newCart[index].quantity += delta;
            if (newCart[index].quantity <= 0) {
                newCart.splice(index, 1);
            }
            saveCart(newCart);
        }
    };

    const removeItem = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        saveCart(newCart);
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);
    
    const closeCart = () => setIsCartOpen(false);

    const clearCart = () => {
        saveCart([]);
    };

    const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ 
            cart, addToCart, changeQuantity, removeItem, clearCart,
            isCartOpen, toggleCart, closeCart,
            cartTotalItems, cartTotalPrice 
        }}>
            {children}
        </CartContext.Provider>
    );
};
