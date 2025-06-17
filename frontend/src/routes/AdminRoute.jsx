import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

export default function AdminRoute({ children }) {
  const { user } = useUserStore();

  if (!user) {
    // Nếu chưa đăng nhập
    return <Navigate to="/login" />;
  }

  if (!user.isAdmin) {
    // Nếu không phải admin
    return <Navigate to="/unauthorized" />;
  }

  // Nếu là admin
  return children;
}
