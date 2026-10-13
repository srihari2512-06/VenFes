import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [token]);

  async function fetchCart() {
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(productId, variantId = null, quantity = 1) {
    if (!token) throw new Error('Please login to add items to your cart');
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId, variantId, quantity })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to add item to cart');
    setCart(data.data.cart);
    return data.data.cart;
  }

  async function updateQuantity(itemId, quantity) {
    const res = await fetch(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to update item');
    setCart(data.data.cart);
  }

  async function removeItem(itemId) {
    const res = await fetch(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to remove item');
    setCart(data.data.cart);
  }

  function clearCart() {
    setCart({ items: [] });
  }

  const itemCount = cart.items ? cart.items.reduce((acc, curr) => acc + curr.quantity, 0) : 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, clearCart, fetchCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
