const orderService = require("../services/orderService");
const Product = require("../models/Product");

// [POST] /api/orders - Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = req.body;
    const savedOrder = await orderService.createOrder(orderData, userId);
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  //   const {
  //     orderItems,
  //     shippingAddress,
  //     paymentMethod,
  //     totalPrice,
  //     discountAmount = 0,
  //     finalPrice,
  //     couponCode = "",
  //   } = req.body;

  //   if (!orderItems || orderItems.length === 0) {
  //     return res
  //       .status(400)
  //       .json({ message: "Không có sản phẩm nào trong đơn hàng" });
  //   }

  //   // Optional: Kiểm tra mã giảm giá
  //   // if (couponCode) {
  //   //   const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
  //   //   if (!coupon) {
  //   //     return res.status(400).json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn." });
  //   //   }
  //   // }

  //   const newOrder = new Order({
  //     user: req.user.id,
  //     orderItems,
  //     shippingAddress,
  //     paymentMethod,
  //     totalPrice,
  //     discountAmount,
  //     finalPrice,
  //     couponCode: couponCode.toUpperCase(),
  //     isPaid: paymentMethod !== "COD",
  //     status: "Processing",
  //   });

  //   const savedOrder = await newOrder.save();
  //   res.status(201).json(savedOrder);
  // } catch (error) {
  //   console.error("Lỗi tạo đơn hàng:", error);
  //   res.status(500).json({ message: "Tạo đơn hàng thất bại." });
  // }
};

// [GET] /api/orders/my - Lấy đơn hàng của người dùng hiện tại
const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/orders - Admin: lấy tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, isDelivered, paymentStatus } = req.query;
    const result = await orderService.getAllOrders(
      { isDelivered, paymentStatus },
      { page, limit }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/orders/:id - Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user.id,
      req.user.isAdmin
    );
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// [PUT] /api/orders/:id/deliver - Admin cập nhật trạng thái giao hàng
const markAsDelivered = async (req, res) => {
  try {
    const updatedorder = await orderService.markAsDelivered(req.params.id);
    res.json({
      message: "Đã cập nhật trạng thái giao hàng",
      order: updatedorder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [PUT] /api/orders/:id/pay - Cập nhật trạng thái thanh toán
const markAsPaid = async (req, res) => {
  try {
    const updated = await orderService.markAsPaid(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id);
    res.json({ success: true, message: "Đơn hàng đã được hủy", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  markAsDelivered,
  markAsPaid,
  cancelOrder,
};
