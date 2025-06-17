import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true, // QUAN TRỌNG: để gửi cookie refreshToken
});

// Thêm token vào request headers (Phần này đã đúng)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ THAY THẾ TOÀN BỘ PHẦN NÀY
// Xử lý token hết hạn hoặc lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra xem request gây lỗi có phải là request đăng nhập hoặc đăng ký không
    const isLoginOrRegisterAttempt =
      originalRequest.url.endsWith("/users/login") ||
      originalRequest.url.endsWith("/users/register");

    // Điều kiện mới:
    // Chỉ refresh token nếu:
    // 1. Lỗi là 401
    // 2. Request chưa được thử lại
    // 3. Request đó KHÔNG PHẢI là request đăng nhập/đăng ký
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginOrRegisterAttempt
    ) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại 1 lần để tránh lặp vô hạn

      try {
        // Gọi API refresh token
        const response = await api.post("/users/refresh");
        const { accessToken } = response.data;

        // Lưu token mới
        localStorage.setItem("token", accessToken);

        // Cập nhật header cho các request sau này
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // Cập nhật header cho request đang bị lỗi và thử lại
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Không thể làm mới token:", refreshError);
        // Nếu refresh thất bại, xóa thông tin và đưa về trang đăng nhập
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        // Quan trọng: Vẫn reject lỗi để hook useQuery/useMutation biết là đã thất bại
        return Promise.reject(refreshError);
      }
    }

    // Đối với tất cả các lỗi khác (bao gồm lỗi 401 từ trang login),
    // chỉ cần reject để component có thể bắt và xử lý.
    return Promise.reject(error);
  }
);

export default api;
