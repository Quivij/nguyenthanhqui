const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để tiếp tục" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, isAdmin: decoded.isAdmin }; // Gán thông tin người dùng từ token vào request

    next(); // Tiến hành tiếp tục qua các middleware hoặc route handler
  } catch (error) {
    console.error("Token verification failed:", error); // Log lỗi chi tiết để dễ debug
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next(); // Nếu là admin, tiếp tục thực hiện action
  } else {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" }); // Nếu không phải admin, trả về lỗi
  }
};

module.exports = { authMiddleware, isAdmin };
