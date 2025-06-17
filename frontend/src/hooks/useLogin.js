import { useMutation, useQueryClient } from "@tanstack/react-query"; // 1. Import thêm useQueryClient
import { loginUser as apiLoginUser } from "../api/auth";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-toastify";

// Helper function để format avatar URL
const formatAvatarUrl = (avatar) => {
  if (!avatar) {
    return "/default-avatar.png";
  }
  if (avatar.startsWith("http")) {
    return avatar;
  }
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return `${apiUrl}${avatar}`;
};

/**
 * Hook xử lý logic đăng nhập sử dụng React Query.
 */
export const useLogin = () => {
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient(); // 2. Lấy queryClient từ hook

  const mutation = useMutation({
    mutationFn: (credentials) => apiLoginUser(credentials),
    onSuccess: (data) => {
      const userWithFormattedAvatar = {
        ...data.user,
        avatar: formatAvatarUrl(data.user.avatar),
      };

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(userWithFormattedAvatar));
      setUser(userWithFormattedAvatar);

      // 3. Vô hiệu hóa các query cũ sau khi đăng nhập thành công
      // Điều này đảm bảo dữ liệu của người dùng mới sẽ được fetch lại.
      // Bạn có thể chỉ định chính xác queryKey bạn dùng để fetch profile, ví dụ: ['profile']
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success(data.message || "Đăng nhập thành công!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  return mutation;
};
