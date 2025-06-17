import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../store/useUserStore";

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useUserStore((state) => state.logout);

  const handleLogout = () => {
    try {
      // Call logout from the store
      logout();

      // Show success message
      toast.success("Đăng xuất thành công!");

      // Navigate to login page
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // If there's an error, still try to clear the state and redirect
      useUserStore.getState().logout();
      navigate("/login");
    }
  };

  return { handleLogout };
};
