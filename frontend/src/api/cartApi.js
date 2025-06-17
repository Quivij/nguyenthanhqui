import { removeMultipleItemsFromCart } from "../../../backend/src/services/cartService";
import api from "./api";

const cartApi = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/cart', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, storage, quantity) => {
    try {
      console.log('Sending:', { productId, storage, quantity });
      const response = await api.post('/cart/add', {
        productId,
        storage,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error details:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      console.log('Updating cart item:', { itemId, quantity });
      const response = await api.put(`/cart/item/${itemId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },
  // Update quantity by product and storage
  updateQuantity: async (productId, storage, quantity) => {
    try {
      // First get the cart to find the item ID
      const cart = await cartApi.getCart();
      const cartItem = cart.items.find(
        item => item.product._id === productId && item.variant.storage === storage
      );
      
      if (!cartItem) {
        throw new Error('Cart item not found');
      }

      // Then update using the item ID
      const response = await cartApi.updateCartItem(cartItem._id, quantity);
      return response;
    } catch (error) {
      console.error('Error updating quantity:', error.response?.data);
      throw error;
    }
  },
  removeMultipleItemsFromCart: async (items) => {
    try{
      const response = await api.delete('/cart/remove-multiple', {
        data: { items },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error removing multiple items:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },
  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error removing item:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },
};

export default cartApi;
