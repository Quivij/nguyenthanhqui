import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const links = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Sản phẩm", path: "/admin/products" },
    { name: "Đơn hàng", path: "/admin/orders" },
    { name: "Người dùng", path: "/admin/users" },
    { name: "Khuyến mãi", path: "/admin/coupons" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4 text-xl font-bold text-blue-600">
        Quản trị hệ thống
      </div>
      <nav className="mt-4">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `block px-4 py-2 text-gray-700 hover:bg-blue-100 ${
                isActive ? "bg-blue-200 font-medium" : ""
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
