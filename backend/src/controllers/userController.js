const User = require("../models/User"); // Đảm bảo đường dẫn đúng
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const axios = require("axios");
const {
  registerUserService,
  loginUserService,
  getUserInfoService,
  getAllUsersService,
  getUserDetailService,
  getAllUsersRawSevice,
  updateUserService,
  createUserService,
  loginWithGoogleService,
  loginWithFacebookService,
} = require("../services/userService");

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  return payload;
}
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Tạo Refresh Token (hết hạn sau 30 ngày)
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      isAdmin: user.isAdmin,
      name: user.name,
      email: user.email,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const data = await registerUserService(
      name,
      email,
      password,
      confirmPassword
    );
    const accessToken = generateAccessToken(data);
    const refreshToken = generateRefreshToken(data);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
  // return res.status(200).json({ name, email, password });
};

///////ĐĂNG NHÂP
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Gọi service để xử lý logic đăng nhập
    const user = await loginUserService(email, password);

    // Tạo JWT token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Lưu Refresh Token vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/", // Thêm path để đảm bảo cookie được gửi đúng
    });

    // Trả về thông tin người dùng cùng với avatar
    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar, // Giờ đây frontend sẽ tự xử lý URL
        isAdmin: user.isAdmin,
      },
      accessToken,
    });
  } catch (error) {
    // Bắt lỗi từ service và gửi về cho client
    if (error.message === "Email hoặc mật khẩu không chính xác.") {
      // Gửi status 401 (Unauthorized) và thông báo lỗi cụ thể
      return res.status(401).json({ message: error.message });
    }

    // Đối với các lỗi không mong muốn khác, trả về lỗi 500
    console.error("Lỗi đăng nhập không xác định:", error);
    res.status(500).json({ message: "Đã có lỗi xảy ra, vui lòng thử lại." });
  }
};
////////////////////////LẤY THÔNG TIN NGƯỜI DÙNG
const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ token

    // Gọi service để lấy thông tin người dùng
    const user = await getUserInfoService(userId);

    // Trả về thông tin người dùng bao gồm avatar
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "/default-avatar.png", // trả về avatar nếu có
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error(error);
    res
      .status(error.message === "Người dùng không tìm thấy" ? 404 : 500)
      .json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search = "", isAdmin = "all", page = 1, limit = 10 } = req.query;

    // Gọi service để lấy danh sách người dùng
    const result = await getAllUsersService(search, isAdmin, page, limit);

    // Trả về phản hồi
    res.status(200).json({
      users: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(error); // Log lỗi để debug
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng" });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user; // Lấy thông tin người dùng hiện tại từ token

    // Gọi service để lấy thông tin chi tiết người dùng
    const user = await getUserDetailService(userId, currentUser);

    // Trả về thông tin người dùng
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    const statusCode =
      error.message === "Người dùng không tồn tại"
        ? 404
        : error.message === "Bạn không có quyền xem thông tin người dùng này"
        ? 403
        : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

////////////////////XÓA THÔNG TIN NGƯỜI DÙNG
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    res.status(200).json({ message: "Xoá người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá người dùng" });
  }
};

////////TOKEN HET HAN
const refreshToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "Chưa đăng nhập" });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Token không hợp lệ" });

      const newAccessToken = generateAccessToken({
        id: user.id,
        isAdmin: user.isAdmin,
      });

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// Đăng xuất (Xóa Refresh Token)
const logoutUser = (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Đăng xuất thành công" });
};

// Update user profile

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
const updateMyUssr = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ token
    const { name, email, phone, address } = req.body;

    let updateData = { name, email, phone, address };

    // Nếu có file avatar (upload mới)
    if (req.file) {
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      updateData.avatar = avatarPath;
    }

    const updatedUser = await updateUserService(userId, updateData);

    res.status(200).json({
      message: "Cập nhật thông tin thành công!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin người dùng:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi cập nhật thông tin người dùng." });
  }
};
const updateUser = async (req, res) => {
  try {
    const isAdmin = req.user.isAdmin;
    const userId = req.params.id || req.user.id; // ✅ Sửa tại đây

    const { name, email, phone, address, isAdmin: updatedIsAdmin } = req.body;

    let updateData = { name, email, phone, address };

    // Chỉ admin mới được cập nhật quyền isAdmin
    if (isAdmin && typeof updatedIsAdmin === "boolean") {
      updateData.isAdmin = updatedIsAdmin;
    }

    // Nếu có file avatar (upload mới)
    if (req.file) {
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      updateData.avatar = avatarPath;
    }

    const updatedUser = await updateUserService(userId, updateData, isAdmin);

    res.status(200).json({
      message: "Cập nhật người dùng thành công!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi cập nhật user:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật người dùng." });
  }
};
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, isAdmin } = req.body;

    const newUser = await UserService.createUserService({
      name,
      email,
      password,
      phone,
      address,
      isAdmin,
    });

    res.status(201).json({
      message: "Tạo người dùng thành công",
      user: newUser,
    });
  } catch (error) {
    if (error.message === "Email đã tồn tại") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi khi tạo người dùng" });
  }
};

// Lấy tất cả người dùng
const getAllUsersRaw = async (req, res) => {
  try {
    const users = await UserService.getAllUsersService();
    res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi xuất tất cả người dùng:", error);
    res.status(500).json({ message: "Lỗi khi lấy tất cả người dùng" });
  }
};

// Đăng nhập bằng Google
const loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    const result = await loginWithGoogleService(token);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi Google Login:", error);

    // Trả mã lỗi 400 nếu là lỗi logic (ví dụ tài khoản đã tồn tại)
    if (
      error.message ===
      "Tài khoản đã tồn tại. Vui lòng đăng nhập bằng email và mật khẩu."
    ) {
      return res.status(400).json({
        message: error.message,
        email: error.email || null, // truyền email về nếu có
      });
    }

    return res.status(401).json({ message: "Đăng nhập Google thất bại" });
  }
};

// Đăng nhập bằng Facebook
const loginWithFacebook = async (req, res) => {
  try {
    const { accessToken, userID } = req.body;
    const { user, accessToken: token } =
      await UserService.loginWithFacebookService(accessToken, userID);

    res.json({
      message: "Đăng nhập Facebook thành công",
      user,
      accessToken: token,
    });
  } catch (error) {
    console.error("Lỗi Facebook Login:", error);

    if (error.message === "Thiếu thông tin từ Facebook") {
      return res.status(400).json({ message: error.message });
    }
    res.status(401).json({ message: "Xác thực Facebook thất bại" });
  }
};
// Thêm controller này vào file của bạn

const changePassword = async (req, res) => {
  try {
    // 1. Lấy thông tin từ request
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 2. Kiểm tra dữ liệu đầu vào
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu mới không khớp." });
    }

    // 3. Tìm người dùng trong DB
    // Quan trọng: không dùng .select('-password') vì chúng ta cần mật khẩu để so sánh
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // 4. So sánh mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại không chính xác." });
    }

    // 5. Hash mật khẩu mới và cập nhật
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server khi đổi mật khẩu." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  getUserInfo,
  getAllUsers,
  getUserDetail,
  deleteUser,
  refreshToken,
  logoutUser,
  createUser,
  getMyProfile,
  getAllUsersRaw,
  loginWithGoogle,
  loginWithFacebook,
  changePassword,
};
