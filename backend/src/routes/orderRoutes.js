const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  markAsDelivered,
  markAsPaid,
  cancelOrder,
} = require("../controllers/orderController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);
router.get("/", authMiddleware, isAdmin, getAllOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/deliver", authMiddleware, isAdmin, markAsDelivered);
router.put("/:id/pay", authMiddleware, markAsPaid); // người dùng thanh toán hoặc webhook
router.patch("/cancel/:id", authMiddleware, cancelOrder);
// router.get("", authMiddleware, ca);
module.exports = router;
