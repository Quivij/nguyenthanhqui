const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  removeMultipleItemsFromCart,
} = require("../controllers/cartController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/cart - lấy giỏ hàng người dùng
router.get("/", authMiddleware, getCart);

// POST /api/cart - thêm sản phẩm vào giỏ
router.post("/", authMiddleware, addToCart);

// PUT /api/cart - cập nhật số lượng
router.put("/update", authMiddleware, updateCartItem);

// DELETE /api/cart - xóa sản phẩm khỏi giỏ
router.delete("/remove", authMiddleware, removeFromCart);

// DELETE /api/cart/all - xóa toàn bộ giỏ hàng
router.delete("/clear", authMiddleware, clearCart);
router.delete("/remove-multiple", authMiddleware, removeMultipleItemsFromCart);

module.exports = router;
