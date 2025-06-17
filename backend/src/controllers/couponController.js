// controllers/couponController.js
const couponService = require("../services/couponService");
const Coupon = require("../models/Coupon");

exports.createCoupon = async (req, res) => {
  try {
    const newCoupon = await couponService.createCoupon(req.body);
    res.status(201).json(newCoupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    console.log("=== Coupon Validation Request ===");
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);
    console.log("Request method:", req.method);
    console.log("Request path:", req.path);
    
    const { code, orderTotal } = req.body;
    
    if (!code) {
      console.log("Missing coupon code");
      return res.status(400).json({ message: "Thiếu mã giảm giá" });
    }

    // Validate orderTotal
    const total = Number(orderTotal);
    if (isNaN(total) || total <= 0) {
      console.log("Invalid order total:", orderTotal);
      return res.status(400).json({ 
        message: "Tổng đơn hàng không hợp lệ",
        details: "Tổng đơn hàng phải là một số lớn hơn 0"
      });
    }

    console.log("Validating coupon:", { code, total });
    const result = await couponService.validateCoupon(code, total);
    console.log("Validation result:", result);
    res.status(200).json(result);
  } catch (err) {
    console.error("Coupon validation error:", err);
    res.status(err.status || 500).json({ 
      message: err.message || "Lỗi server",
      details: err.details || "Vui lòng thử lại sau"
    });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponService.getAllCoupons();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCouponById = async (req, res) => {
  try {
    await couponService.deleteCouponById(req.params.id);
    res.json({ message: "Đã xóa mã khuyến mãi" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
