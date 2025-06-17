const express = require("express");
const {
  createCoupon,
  validateCoupon,
  getAllCoupons,
  deleteCouponById,
} = require("../controllers/couponController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes - no authentication required
router.post("/validate", validateCoupon);

// Admin routes - require authentication and admin role
router.use(authMiddleware);
router.post("/", isAdmin, createCoupon);
router.get("/", isAdmin, getAllCoupons);
router.delete("/:id", isAdmin, deleteCouponById);

module.exports = router;
