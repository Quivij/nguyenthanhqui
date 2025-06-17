const app = require("./app"); // Import app từ file app.js

const PORT = process.env.PORT || 3001;
console.log("gg id" , process.env.VITE_GOOGLE_CLIENT_ID);
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});
