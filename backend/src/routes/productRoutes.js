const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware"); // Giả sử bạn đã tạo file upload.js trong middleware
const productCtrl = require("../controllers/productController");

// Tạo sản phẩm mới (bao gồm upload ảnh)
router.post("/", upload.any(), productCtrl.createProduct);

// Lấy danh sách sản phẩm (có thể lọc theo category, brand, search)
router.get("/", productCtrl.getProducts);
router.get("/search", productCtrl.searchProduct);
// Lấy chi tiết sản phẩm
router.get("/:id", productCtrl.getProductById);

// Cập nhật sản phẩm (bao gồm upload ảnh nếu có)
// Thay vì upload.array("images") → dùng any()
router.put("/:id", upload.any(), productCtrl.updateProduct);

// Xóa sản phẩm
router.delete("/:id", productCtrl.deleteProduct);

// API thêm đánh giá
router.post("/:id/ratings", productCtrl.addRating);

module.exports = router;
