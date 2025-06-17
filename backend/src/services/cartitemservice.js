const Cart = require('../models/Cart');
const CartItem = require('../models/cartitem');
const Product = require('../models/Product');

class CartItemService {
  async findUserCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'cartItems',
      populate: { path: 'product',select: 'name price variants images' },
    });

    // Nếu chưa có giỏ hàng thì tạo mới
    if (!cart) {
      cart = new Cart({ user: userId, cartItems: [] });
      await cart.save();
    }

    return cart;
  }


  async updateCartItem(userId, cartItemId, data) {
    const cart = await this.findUserCart(userId);

    const item = await CartItem.findById(cartItemId);
    if (!item) throw new Error('CartItem not found');

    if (data.quantity !== undefined) item.quantity = data.quantity;
    await item.save();

    return item;
  }

  async deleteCartItem(userId, cartItemId) {
    const cart = await this.findUserCart(userId);

    cart.cartItems = cart.cartItems.filter(
      (item) => item.toString() !== cartItemId
    );
    await cart.save();

    await CartItem.findByIdAndDelete(cartItemId);
    return true;
  }
}

module.exports = new CartItemService();
