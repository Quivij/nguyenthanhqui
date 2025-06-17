import { useState, useCallback } from 'react';
import cartApi from '../api/cartApi';

const useCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err, defaultMessage) => {
    if (err?.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError(err.message || defaultMessage);
    }
  };

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      handleError(err, 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (productId, storage, quantity) => {
    setLoading(true);
    setError(null);
    try {
      await cartApi.addToCart(productId, storage, quantity);
      await fetchCart();
    } catch (err) {
      handleError(err, 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (cartItemId) => {
    setLoading(true);
    setError(null);
    try {
      await cartApi.removeFromCart(cartItemId);
      await fetchCart();
    } catch (err) {
      handleError(err, 'Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateItemQuantity = useCallback(async (cartItemId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      await cartApi.updateCartItem(cartItemId, quantity);
      await fetchCart();
    } catch (err) {
      handleError(err, 'Failed to update cart item');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    removeItem,
    updateItemQuantity,
    clearError,
  };
};

export default useCart;
