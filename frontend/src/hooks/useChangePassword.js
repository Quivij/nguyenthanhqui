import { useMutation } from "@tanstack/react-query";
import api from "../api/api"; // Giả sử bạn có file cấu hình axios tại đây

/**
 * Hàm thực hiện gọi API để đổi mật khẩu.
 * @param {object} passwordData - Dữ liệu mật khẩu từ form.
 * @returns {Promise<object>} - Dữ liệu trả về từ server.
 */
const changePassword = async (passwordData) => {
  // passwordData sẽ là object chứa: { currentPassword, newPassword, confirmPassword }
  // Endpoint này bạn cần tạo ở backend
  const { data } = await api.put("users/change-password", passwordData);
  return data;
};

/**
 * Custom hook để xử lý việc thay đổi mật khẩu.
 * Cung cấp các trạng thái isLoading, isError và hàm mutate.
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    // Bạn có thể thêm các xử lý chung ở đây nếu cần,
    // nhưng thường xử lý ở component sẽ linh hoạt hơn.
  });
};
