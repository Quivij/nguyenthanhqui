import { Outlet } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
