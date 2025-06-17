import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

import Home from "../pages/Home";
import ProductListPage from "../pages/ProductListPage";

import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProfilePage from "../pages/ProfilePage";
import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";

import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import AdminProduct from "../pages/admin/AdminProducts";
import AdminOrdersPage from "../pages/admin/Orders";
import CartPage from "../pages/CartPage";
import CreateProduct from "../pages/admin/CreateProduct";
import EditProduct from "../pages/admin/EditProduct";

import AdminUser from "../pages/admin/AdminUser";
import EditUser from "../pages/admin/EditUser";
import CreateUserPage from "../pages/admin/CreateUserPage";
import AdminOrderDetail from "../pages/admin/AdminOrderDetail";

// ✅ MỚI: Import các trang liên quan đến đặt hàng
import CheckoutPage from "../pages/CheckoutPage";
import MyOrdersPage from "../pages/MyOrdersPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import CreateCoupon from "../pages/admin/CreateCoupon";
import CouponList from "../pages/admin/CouponList";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Main Layout routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/products/:brand" element={<ProductListPage />} />

          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<CartPage />} />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="unauthorized" element={<Unauthorized />} />

          <Route
            path="profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* ✅ MỚI: Checkout và đơn hàng cá nhân */}
          <Route
            path="checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="orders/my"
            element={
              <PrivateRoute>
                <MyOrdersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <PrivateRoute>
                <OrderDetailPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products">
            <Route index element={<AdminProduct />} />
            <Route path="create" element={<CreateProduct />} />
            <Route path="edit/:id" element={<EditProduct />} />
          </Route>
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />

          <Route path="users">
            <Route index element={<AdminUser />} />
            <Route path="edit/:id" element={<EditUser />} />
            <Route path="create" element={<CreateUserPage />} />
          </Route>
          <Route path="coupons">
            <Route index element={<CouponList />} />
            <Route path="create" element={<CreateCoupon />} />
          </Route>
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
