import { useMutation } from "@tanstack/react-query";
import api from "../api/api";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-toastify";

// Helper function để format avatar URL (bạn có thể đưa hàm này ra file utils chung)
const formatAvatarUrl = (avatar) => {
  if (!avatar) return "/default-avatar.png";
  if (avatar.startsWith("http")) return avatar;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return `${apiUrl}${avatar}`;
};

const googleLogin = (googleToken) => {
  return api.post("/auth/google", { token: googleToken });
};

export const useGoogleLoginMutation = () => {
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: googleLogin,
    onSuccess: (result) => {
      const userWithFormattedAvatar = {
        ...result.data.user,
        avatar: formatAvatarUrl(result.data.user.avatar),
      };

      localStorage.setItem("token", result.data.accessToken);
      localStorage.setItem("user", JSON.stringify(userWithFormattedAvatar));
      setUser(userWithFormattedAvatar);

      toast.success("Đăng nhập Google thành công!");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Đăng nhập Google thất bại";
      toast.error(message);
    },
  });
};
