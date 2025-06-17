const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      // Dùng MONGO_DB từ biến môi trường
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Dừng ứng dụng nếu không thể kết nối MongoDB
  }
};

module.exports = connectDB;
