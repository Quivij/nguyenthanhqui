import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "../api/auth";
import { useUserStore } from "../store/useUserStore";

export const useUpdateProfile = () => {
  const { setUser } = useUserStore(); // ✅ Dùng đúng tên hàm trong store

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      console.log("Cập nhật thông tin thành công", data.message);
      setUser(data.user); // ✅ Sử dụng đúng hàm cập nhật user
    },
    onError: (error) => {
      console.error("Error during update:", error);
    },
  });
};