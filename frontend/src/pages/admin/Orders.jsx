import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { utils, writeFile } from "xlsx";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/api";
import BackButton from "../../components/BackButton";

const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const res = await api.get("/orders", {
        params: { page: 1, limit: 10000 },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data;
    },
  });

  const orders = data?.orders ?? [];

  const deliverMutation = useMutation({
    mutationFn: (id) =>
      api.put(`/orders/${id}/deliver`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    onSuccess: () => {
      toast.success("Đã đánh dấu là đã giao");
      queryClient.invalidateQueries(["adminOrders"]);
    },
    onError: () => toast.error("Cập nhật giao hàng thất bại"),
  });

  const payMutation = useMutation({
    mutationFn: (id) =>
      api.put(`/orders/${id}/pay`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    onSuccess: () => {
      toast.success("Đã đánh dấu là đã thanh toán");
      queryClient.invalidateQueries(["adminOrders"]);
    },
    onError: () => toast.error("Cập nhật thanh toán thất bại"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) =>
      api.patch(`/orders/cancel/${id}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    onSuccess: () => {
      toast.success("Đơn hàng đã bị hủy");
      queryClient.invalidateQueries(["adminOrders"]);
    },
    onError: () => toast.error("Không thể hủy đơn hàng"),
  });

  const filteredOrders = orders.filter((order) =>
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const exportData = filteredOrders.map((order) => ({
      "Mã đơn": order._id,
      "Người mua": order.user?.name,
      "Tổng tiền": order.totalPrice,
      "Giảm giá": order.discountAmount || 0,
      "Thanh toán cuối": order.finalPrice || order.totalPrice,
      "Phương thức": order.paymentMethod,
      "Ngày tạo": new Date(order.createdAt).toLocaleDateString("vi-VN"),
      "Thanh toán":
        order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán",
      "Giao hàng": order.isDelivered ? "Đã giao" : "Chưa giao",
      "Trạng thái": order.status,
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Orders");
    writeFile(wb, "DanhSachDonHang.xlsx");
  };

  const getBadgeClass = (type, value) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    if (type === "status") {
      return `${base} ${
        value === "Cancelled"
          ? "bg-gray-300 text-gray-800"
          : value === "Delivered"
          ? "bg-green-100 text-green-800"
          : "bg-blue-100 text-blue-800"
      }`;
    }
    if (type === "payment") {
      return `${base} ${
        value === "paid"
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
      }`;
    }
    if (type === "delivery") {
      return `${base} ${
        value ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
      }`;
    }
    return base;
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Quản lý đơn hàng</h1>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm"
        >
          Xuất Excel
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên người mua..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-600 py-4">Đang tải...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-3 border">Mã đơn</th>
                <th className="p-3 border">Người mua</th>
                <th className="p-3 border">Tổng tiền</th>
                <th className="p-3 border">Giảm giá</th>
                <th className="p-3 border">Thanh toán cuối</th>
                <th className="p-3 border">Phương thức</th>
                <th className="p-3 border">Ngày tạo</th>
                <th className="p-3 border">Thanh toán</th>
                <th className="p-3 border">Giao hàng</th>
                <th className="p-3 border">Trạng thái</th>
                <th className="p-3 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-gray-500">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 border">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-3 border">{order.user?.name}</td>
                    <td className="p-3 border text-red-600 font-semibold">
                      {order.totalPrice.toLocaleString()}₫
                    </td>
                    <td className="p-3 border text-green-600 font-semibold">
                      -{(order.discountAmount || 0).toLocaleString()}₫
                    </td>
                    <td className="p-3 border text-blue-600 font-semibold">
                      {(order.finalPrice || order.totalPrice).toLocaleString()}₫
                    </td>
                    <td className="p-3 border">{order.paymentMethod}</td>
                    <td className="p-3 border">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3 border">
                      <span
                        className={getBadgeClass(
                          "payment",
                          order.paymentStatus
                        )}
                      >
                        {order.paymentStatus === "paid"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </span>
                    </td>
                    <td className="p-3 border">
                      <span
                        className={getBadgeClass("delivery", order.isDelivered)}
                      >
                        {order.isDelivered ? "Đã giao" : "Chưa giao"}
                      </span>
                    </td>
                    <td className="p-3 border">
                      <span className={getBadgeClass("status", order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 border">
                      <div className="flex flex-wrap gap-2">
                        {order.paymentStatus !== "paid" &&
                          order.status !== "Cancelled" && (
                            <button
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                              onClick={() => payMutation.mutate(order._id)}
                            >
                              Đánh dấu thanh toán
                            </button>
                          )}
                        {!order.isDelivered && order.status !== "Cancelled" && (
                          <>
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                              onClick={() => deliverMutation.mutate(order._id)}
                            >
                              Đánh dấu giao hàng
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                              onClick={() => cancelMutation.mutate(order._id)}
                            >
                              Hủy đơn
                            </button>
                          </>
                        )}
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-1 rounded"
                        >
                          Xem
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
