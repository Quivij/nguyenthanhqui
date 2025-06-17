const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Đảm bảo thư mục avatars tồn tại
const avatarDirectory = path.join(__dirname, "../uploads/avatars");

if (!fs.existsSync(avatarDirectory)) {
  fs.mkdirSync(avatarDirectory, { recursive: true });
}

// Cấu hình lưu trữ cho avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDirectory);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const filename = `${Date.now()}-${Math.floor(Math.random() * 1e8)}.${ext}`;
    cb(null, filename);
  },
});

const uploadAvatar = multer({ storage });

module.exports = uploadAvatar;
