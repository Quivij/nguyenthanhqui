require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

async function verifyToken(token) {
  const tiket = await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  });
  const payload = tiket.getPayload();
  return payload;
}
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
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

const registerUserService = async (name, email, password, confirmPassword) => {
  // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp không
  if (password !== confirmPassword) {
    throw new Error("Mật khẩu và xác nhận mật khẩu không khớp");
  }

  // Kiểm tra xem email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Tạo người dùng mới
  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  await user.save();

  return user;
};

const loginUserService = async (email, password) => {
  // 1. Kiểm tra xem email có tồn tại không
  const user = await User.findOne({ email }); // Viết gọn hơn
  if (!user) {
    // Lỗi cụ thể khi không tìm thấy email
    throw new Error("Email hoặc mật khẩu không chính xác.");
  }

  // 2. Kiểm tra mật khẩu có đúng không
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // Lỗi cụ thể khi sai mật khẩu
    throw new Error("Email hoặc mật khẩu không chính xác.");
  }

  // 3. Nếu mọi thứ đều đúng, chỉ cần trả về user
  // Việc tạo token sẽ do controller đảm nhiệm
  return user;
};

const getUserInfoService = async (userId) => {
  // Tìm người dùng theo ID
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tìm thấy");
  }
  return user;
};
const getAllUsersService = async (search, isAdmin, page, limit) => {
  const query = {};

  // Xây dựng query tìm kiếm
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (isAdmin === "true") {
    query.isAdmin = true;
  } else if (isAdmin === "false") {
    query.isAdmin = false;
  }

  const skip = (page - 1) * limit;

  // Lấy danh sách người dùng
  const users = await User.find(query)
    .skip(skip)
    .limit(Number(limit))
    .select("-password") // Ẩn password
    .sort({ createdAt: -1 });

  // Tính tổng số người dùng và số trang
  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    pagination: {
      totalUsers,
      totalPages,
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};
const getUserDetailService = async (userId, currentUser) => {
  // Kiểm tra quyền truy cập: Nếu không phải admin, chỉ được xem thông tin của chính mình
  if (!currentUser.isAdmin && currentUser.id.toString() !== userId.toString()) {
    throw new Error("Bạn không có quyền xem thông tin người dùng này");
  }

  // Tìm người dùng theo ID
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  return user;
};
const updateMyUserService = async (userId, updateData) => {
  if (!userId) {
    throw new Error("ID người dùng không được để trống");
  }
  // Tìm người dùng theo ID và cập nhật thông tin
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");
  if (!updatedUser) {
    throw new Error("Người dùng không tồn tại");
  }
};
const updateUserService = async (userId, updateData, isAdmin) => {
  if (!userId) {
    throw new Error("ID người dùng không được để trống");
  }
  if (!isAdmin && "isAdmin" in updateData) {
    throw new Error("Bạn không có quyền cập nhật thông tin người dùng này");
  }
  if (!isAdmin) {
    delete updateData.isAdmin;
  }
  // Tìm người dùng theo ID và cập nhật thông tin
  const uppdatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");
  if (!uppdatedUser) {
    throw new Error("Người dùng không tồn tại");
  }
  return uppdatedUser;
};
const createUserService = async (userData) => {
  const { email } = userData;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email đã tồn tại");
  }

  const newUser = new User(userData);
  await newUser.save();

  return newUser;
};

// Lấy tất cả người dùng (không bao gồm password)
const getAllUsersRawSevice = async () => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  return users;
};
console.log("clientId", clientId);
// Đăng nhập bằng Google
const loginWithGoogleService = async (token) => {
  if (!token) throw new Error("Thiếu token từ Google");

  try {
    // Lấy thông tin người dùng từ Google
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { email, name, picture, sub } = response.data;

    // Tìm user theo email
    let user = await User.findOne({ email });

    if (user) {
      // Nếu tài khoản đã tồn tại nhưng không phải đăng nhập bằng Google
      if (user.provider !== "google") {
        throw new Error(
          "Tài khoản đã tồn tại. Vui lòng đăng nhập bằng email và mật khẩu."
        );
      }
    } else {
      // Nếu chưa có user → tạo mới
      user = await User.create({
        name,
        email,
        avatar: picture,
        provider: "google",
        providerId: sub,
        password: null,
      });
    }

    // Tạo access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      },
      accessToken,
    };
  } catch (error) {
    console.error("Google OAuth error:", error.message);
    throw new Error(error.message || "Xác thực Google thất bại");
  }
};

// Đăng nhập bằng Facebook
const loginWithFacebookService = async (accessToken) => {
  if (!accessToken || !userID) throw new Error("Thiếu thông tin từ Facebook");

  const fbRes = await axios.get(`https://graph.facebook.com/v12.0/${userID}`, {
    params: {
      access_token: accessToken,
      fields: "id,name,email,picture",
    },
  });

  const { email, name, id, picture } = fbRes.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      avatar: picture.data.url,
      provider: "facebook",
      providerId: id,
      password: null,
    });
  }

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, accessToken: token };

  // Cập nhật người dùng (đã triển khai trước đó)
};

module.exports = {
  registerUserService,
  loginUserService,
  getUserInfoService,
  getAllUsersService,
  getUserDetailService,
  updateUserService,
  createUserService,
  getAllUsersRawSevice,
  loginWithGoogleService,
  loginWithFacebookService,
};
