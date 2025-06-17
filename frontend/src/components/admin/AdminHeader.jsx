import { useLogout } from "../../hooks/useLogout";
import { useUserStore } from "../../store/useUserStore";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const { handleLogout } = useLogout();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-3">
      <div className="text-lg font-semibold text-gray-700">Trang tổng quan</div>
      <div className="flex items-center space-x-4">
        <img
          src={user?.avatar || "/default-avatar.png"}
          alt="Admin Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-gray-700 text-sm">{user?.email}</span>

        {/* Nút về trang chủ */}
        <button
          onClick={handleGoHome}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Trang chủ
        </button>

        {/* Nút đăng xuất */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
