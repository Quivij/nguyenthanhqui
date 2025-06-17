import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

export default function PrivateRoute({ children }) {
  const { user } = useUserStore();

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
