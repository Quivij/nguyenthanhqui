const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Đảm bảo rằng thư mục uploads/products tồn tại
const createFolderIfNotExist = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // Tạo thư mục nếu chưa tồn tại
  }
};

// Đường dẫn đến thư mục uploads/products
const uploadDirectory = path.join(__dirname, "../uploads/products");

// Tạo thư mục nếu nó chưa tồn tại
createFolderIfNotExist(uploadDirectory);

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Đảm bảo rằng tệp sẽ được lưu vào thư mục uploads/products
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    // Tạo tên tệp duy nhất bằng cách sử dụng thời gian hiện tại và một giá trị ngẫu nhiên
    const filename = `${Date.now()}-${Math.floor(Math.random() * 100000000)}.${
      file.mimetype.split("/")[1]
    }`;
    cb(null, filename); // Đặt tên cho tệp
  },
});

// Tạo upload middleware với Multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn kích thước tệp lên đến 10MB
  },
  fileFilter: (req, file, cb) => {
    // Kiểm tra loại tệp hợp lệ (ví dụ: chỉ chấp nhận hình ảnh)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Cho phép tệp
    } else {
      cb(new Error("File type not allowed"), false); // Từ chối tệp
    }
  },
});

module.exports = upload;
