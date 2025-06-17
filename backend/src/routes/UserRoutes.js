const express = require("express");
const router = express.Router();
const uploadAvatar = require("../middleware/uploadAvatar");

const {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserDetail,
  refreshToken,
  logoutUser,
  getMyProfile,
  createUser,
  getAllUsersRaw,
  changePassword,
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// --- CÁC ROUTE CÔNG KHAI (Không cần xác thực) ---
router.get("/status", (req, res) => {
  res.json({ message: "API đang hoạt động" });
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.get("/all", getAllUsersRaw); // Lấy tất cả user (dữ liệu thô)

// --- CÁC ROUTE CẦN XÁC THỰC ---
// Middleware `authMiddleware` sẽ được áp dụng cho tất cả các route bên dưới
router.use(authMiddleware);

// Các route liên quan đến chính người dùng đang đăng nhập (self-actions)
router.post("/logout", logoutUser);
router.get("/profile", getMyProfile);
router.put(
  "/profile",
  uploadAvatar.single("avatar"), // Đặt sau authMiddleware trong trường hợp này là chấp nhận được vì nó thuộc group đã xác thực
  updateUser
);
router.put("/change-password", changePassword); // Đã di chuyển lên đây
router.delete("/profile", deleteUser); // Gợi ý: Dùng /profile thay vì /delete cho nhất quán

// --- CÁC ROUTE CHỈ DÀNH CHO ADMIN ---
// Middleware `isAdmin` sẽ được áp dụng cho các route bên dưới
router.use(isAdmin);

router.get("/", getAllUsers); // Lấy danh sách người dùng có phân trang
router.post("/", createUser); // Tạo người dùng mới
router.get("/:userId", getUserDetail); // Lấy chi tiết user bất kỳ
router.put("/:id", uploadAvatar.single("avatar"), updateUser); // Cập nhật user bất kỳ
router.delete("/:id", deleteUser); // Xóa user bất kỳ

module.exports = router;
