const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser"); // 1. IMPORT COOKIE-PARSER
const connectDB = require("./config/db");
const userRoutes = require("./routes/UserRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoute = require("./routes/dashboardRoute");
const couponRoutes = require("./routes/couponRoutes");
const session = require("express-session");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");
const path = require("path");

// Load biến môi trường từ file .env
dotenv.config();

// Kết nối MongoDB
connectDB();

// Khởi tạo ứng dụng Express
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL của bạn
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Các phương thức HTTP được phép
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"], // Các headers cho phép
    credentials: true, // Cho phép gửi cookie kèm theo yêu cầu
  })
);
app.use(
  session({
    secret: "your-secret-key", // Dùng một chuỗi ngẫu nhiên cho bảo mật
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true nếu bạn sử dụng HTTPS
  })
);

app.use(express.json()); // Xử lý dữ liệu JSON từ request
app.use(cookieParser()); // 2. SỬ DỤNG MIDDLEWARE COOKIE-PARSER TẠI ĐÂY
app.use(morgan("dev")); // Ghi log request

// Định nghĩa các routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/dashboard", dashboardRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/coupons", couponRoutes);
app.use("/api/auth", authRoutes);

// Middleware xử lý lỗi
app.use(errorHandler);

module.exports = app;
