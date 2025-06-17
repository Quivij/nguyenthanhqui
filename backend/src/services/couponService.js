const Coupon = require("../models/Coupon");

class CouponService {
  async createCoupon(data) {
    const newCoupon = new Coupon({
      ...data,
      code: data.code
    });
    return await newCoupon.save();
  }

  async validateCoupon(code, orderTotal) {
    const coupon = await Coupon.findOne({ 
      code: { $regex: new RegExp(`^${code}$`, 'i') },
      isActive: true 
    });
    if (!coupon) {
      throw {
        status: 404,
        message: "Mã không tồn tại hoặc hết hạn"
      };
    }
    if (new Date(coupon.expireDate) < Date.now()) {
      throw {
        status: 400,
        message: "Mã đã hết hạn"
      };
    }
    if (orderTotal < coupon.minOrderValue) {
      throw {
        status: 400,
        message: `Đơn hàng phải từ ${coupon.minOrderValue}₫ để dùng mã này.`
      };
    }
    return {
      valid: true,
      type: coupon.discountType,
      value: coupon.discountValue,
      coupon
    };
  }

  async getAllCoupons() {
    return await Coupon.find();
  }

  async deleteCouponById(id) {
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) throw new Error("Không tìm thấy mã");
    return deleted;
  }
}

module.exports = new CouponService(); 