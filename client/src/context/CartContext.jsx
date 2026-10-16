import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'venfes_guest_cart';

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // When auth token changes: sync any guest cart items to MongoDB and fetch user's cart
  useEffect(() => {
    if (token) {
      syncGuestCartToDatabase();
    } else {
      loadGuestCart();
    }
  }, [token]);

  function loadGuestCart() {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        setCart({ items: [] });
      }
    } catch {
      setCart({ items: [] });
    }
  }

  async function syncGuestCartToDatabase() {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        const guestCart = JSON.parse(saved);
        if (guestCart.items?.length > 0) {
          for (const item of guestCart.items) {
            const pId = item.productId?._id || item.productId;
            if (pId) {
              await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  productId: pId,
                  variantId: item.variantId || null,
                  quantity: item.quantity || 1
                })
              });
            }
          }
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }
    } catch (err) {
      console.warn('Guest cart sync error:', err);
    }
    // Fetch the updated cart from MongoDB database
    await fetchCart();
  }

  async function fetchCart() {
    if (!token) {
      loadGuestCart();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data?.cart) {
        setCart(data.data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart from database', err);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(productId, variantId = null, quantity = 1, productData = null) {
    if (!token) {
      // Guest cart support: save to localStorage and update state
      const currentItems = [...(cart.items || [])];
      const existingIdx = currentItems.findIndex(
        i => (i.productId?._id === productId || i.productId === productId) &&
             (variantId ? i.variantId === variantId : !i.variantId)
      );

      if (existingIdx > -1) {
        currentItems[existingIdx].quantity += Number(quantity);
      } else {
        currentItems.push({
          productId: productData || productId,
          variantId: variantId || null,
          quantity: Number(quantity)
        });
      }
      const updatedCart = { items: currentItems };
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
      setCart(updatedCart);
      return updatedCart;
    }

    // Authenticated: Persist directly to MongoDB database Cart collection
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
    if (!token) {
      const currentItems = (cart.items || []).map(i => {
        if (i._id === itemId || i.productId?._id === itemId || i.productId === itemId) {
          return { ...i, quantity: Number(quantity) };
        }
        return i;
      }).filter(i => i.quantity > 0);
      const updatedCart = { items: currentItems };
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
      setCart(updatedCart);
      return;
    }

    // Persist directly to MongoDB database Cart collection
    const res = await fetch(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to update item in database');
    setCart(data.data.cart);
  }

  async function removeItem(itemId) {
    if (!token) {
      const currentItems = (cart.items || []).filter(
        i => !(i._id === itemId || i.productId?._id === itemId || i.productId === itemId)
      );
      const updatedCart = { items: currentItems };
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
      setCart(updatedCart);
      return;
    }

    // Remove directly from MongoDB database Cart collection
    const res = await fetch(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to remove item from database');
    setCart(data.data.cart);
  }

  function clearCart() {
    setCart({ items: [] });
    localStorage.removeItem(GUEST_CART_KEY);
  }

  const itemCount = (cart && Array.isArray(cart.items))
    ? cart.items.reduce((acc, curr) => acc + (curr.quantity || 1), 0)
    : 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, clearCart, fetchCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
