const mongoose = require("mongoose"); // <-- THÊM DÒNG NÀY
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

class OrderService {
  async createOrder(orderData, userId) {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      discountAmount = 0,
      finalPrice,
      couponCode = "",
    } = orderData;

    if (!orderItems || orderItems.length === 0) {
      throw new Error("Không có sản phẩm nào trong đơn hàng");
    }

    // Validate coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (!coupon) {
        throw new Error("Mã giảm giá không hợp lệ");
      }
      if (new Date(coupon.expireDate) < Date.now()) {
        throw new Error("Mã giảm giá đã hết hạn");
      }
      if (totalPrice < coupon.minOrderValue) {
        throw new Error(
          `Đơn hàng phải từ ${coupon.minOrderValue}₫ để dùng mã này`
        );
      }
    }

    const newOrder = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      discountAmount,
      finalPrice,
      couponCode: couponCode,
      isPaid: paymentMethod !== "COD",
      status: "Processing",
    });
    return await newOrder.save();
  }

  async getMyOrders(userId) {
    return await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("orderItems.product", "name");
  }

  async getAllOrders(filters, pagination) {
    const { page = 1, limit = 10 } = pagination;
    const { isDelivered, paymentStatus } = filters;
    const filter = {};
    if (isDelivered !== undefined) filter.isDelivered = isDelivered === "true";
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(filter);
    return { total, page: Number(page), orders };
  }

  async getOrderById(orderId, userId, isAdmin) {
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("orderItems.product");
    if (!order) throw new Error("Không tìm thấy đơn hàng");
    const isOwner = order.user._id.toString() === userId;
    if (!isAdmin && !isOwner) {
      throw new Error("Bạn không có quyền truy cập đơn hàng này");
    }
    return order;
  }

  async markAsDelivered(orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }
    if (order.isDelivered) {
      throw new Error("Đơn hàng đã được giao trước đó");
    }

    const productUpdatePromises = [];

    for (const item of order.orderItems) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        console.warn(
          `ID sản phẩm không hợp lệ trong đơn hàng ${orderId}: ${item.product}`
        );
        continue;
      }

      const updatePromise = Product.updateOne(
        {
          _id: item.product,
          "variants.color": item.color,
          "variants.storage": item.storage,
        },
        {
          $inc: {
            "variants.$.stock": -item.quantity,
            "variants.$.sold": item.quantity,
            sold: item.quantity,
          },
        }
      );
      productUpdatePromises.push(updatePromise);
    }

    await Promise.all(productUpdatePromises);

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = "Delivered";

    return await order.save();
  }

  async markAsPaid(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng");
    if (order.paymentStatus === "paid") {
      throw new Error("Đơn hàng đã được thanh toán");
    }
    order.paymentStatus = "paid";
    order.paidAt = new Date();
    return await order.save();
  }

  async cancelOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Đơn hàng không tồn tại");
    if (order.status === "Delivered") {
      throw new Error("Không thể hủy đơn hàng đã giao");
    }
    if (order.status === "Cancelled") {
      throw new Error("Đơn hàng đã bị hủy trước đó");
    }
    order.status = "Cancelled";
    return await order.save();
  }
}

module.exports = new OrderService();
