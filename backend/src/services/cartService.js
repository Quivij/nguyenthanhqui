const Cart = require("../models/Cart");

const getCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  return cart || { userId, items: [] };
};

const addToCart = async (userId, productData) => {
  const { productId, name, price, image, color, storage, quantity } = productData;
  
  if (!productId || !name || !price || !color || !storage) {
    throw new Error("Thiếu thông tin sản phẩm");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // const productIdObj = new mongoose.Types.ObjectId(productId); // 🔥 ÉP KIỂU TẠI ĐÂY

  const existingItem = cart.items.find(
    (item) =>
      item.productId.toString() === productId &&
      item.color === color &&
      item.storage === storage
  );

  if (existingItem) {
    existingItem.quantity += quantity || 1;
  } else {
    cart.items.push({
      productId,
      name,
      price,
      image,
      color,
      storage,
      quantity: quantity || 1,
    });
  }

  await cart.save();
  return cart;
};

const updateCartItem = async (userId, { productId, color, storage, quantity }) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new Error("Không tìm thấy giỏ hàng");
  }

  const item = cart.items.find(
    (item) =>
      item.productId.toString() === productId &&
      item.color === color &&
      item.storage === storage
  );

  if (!item) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
  }

  item.quantity = Math.max(1, quantity);
  await cart.save();
  return cart;
};

const removeFromCart = async (userId, { productId, color, storage }) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new Error("Không tìm thấy giỏ hàng");
  }

  cart.items = cart.items.filter(
    (item) =>
      item.productId.toString() !== productId ||
      item.color !== color ||
      item.storage !== storage
  );

  await cart.save();
  return cart;
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return { message: "Đã xóa toàn bộ giỏ hàng" };
};

const removeMultipleItemsFromCart = async (userId, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Danh sách sản phẩm không hợp lệ");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new Error("Không tìm thấy giỏ hàng");
  }

  cart.items = cart.items.filter((item) => {
    return !items.some(
      (rm) =>
        rm.productId === item.productId.toString() &&
        rm.color === item.color &&
        rm.storage === item.storage
    );
  });

  await cart.save();
  return {
    message: "Đã xóa các sản phẩm được chọn",
    cartItems: cart.items,
  };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  removeMultipleItemsFromCart,
}; 