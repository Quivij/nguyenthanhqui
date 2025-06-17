import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

/**
 * Hook để lấy tất cả dữ liệu thống kê cho trang Dashboard.
 * Dữ liệu được fetch một lần và bao gồm tất cả các chế độ xem (ngày, tuần, tháng).
 * @param {string} token - JWT token của người dùng đã đăng nhập.
 */
export const useDashboardStats = (token) => {
  return useQuery({
    // Query key không còn phụ thuộc vào 'view' nữa vì chúng ta lấy tất cả dữ liệu
    queryKey: ["dashboardStats"],

    queryFn: async () => {
      // Gọi API đến endpoint /dashboard mà không cần gửi params
      const res = await api.get("/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },

    // Chỉ chạy query khi token tồn tại
    enabled: !!token,

    // (Tùy chọn nhưng khuyến khích) Giữ dữ liệu là "fresh" trong 5 phút
    // để tránh việc fetch lại không cần thiết khi người dùng focus lại vào cửa sổ.
    staleTime: 1000 * 60 * 5,
  });
};
