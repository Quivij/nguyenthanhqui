import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/api";

const AdminOrderDetail = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminOrderDetail", id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data;
    },
  });

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (error)
    return <div className="p-4 text-red-500">Không thể tải đơn hàng</div>;

  const order = data;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Chi tiết đơn hàng #{order._id.slice(-6).toUpperCase()}
      </h2>

      <div className="space-y-4 bg-white p-4 rounded-lg shadow">
        <div>
          <strong>Người mua:</strong> {order.user?.name} ({order.user?.email})
        </div>
        <div>
          <strong>Ngày đặt:</strong>{" "}
          {new Date(order.createdAt).toLocaleString("vi-VN")}
        </div>
        <div>
          <strong>Trạng thái:</strong>{" "}
          <span className="text-blue-600 font-medium">{order.status}</span>
        </div>
        <div>
          <strong>Thanh toán:</strong>{" "}
          {order.paymentStatus === "paid" ? (
            <span className="text-green-600 font-semibold">Đã thanh toán</span>
          ) : (
            <span className="text-red-500 font-semibold">Chưa thanh toán</span>
          )}
        </div>
        <div>
          <strong>Giao hàng:</strong>{" "}
          {order.isDelivered ? (
            <span className="text-green-600">Đã giao</span>
          ) : (
            <span className="text-gray-600">Chưa giao</span>
          )}
        </div>

        {order.coupon && (
          <div>
            <strong>Mã giảm giá:</strong>{" "}
            <span className="text-blue-600">{order.coupon.code}</span>
          </div>
        )}

        {order.discountAmount > 0 && (
          <div>
            <strong>Giảm giá:</strong>{" "}
            <span className="text-green-600 font-medium">
              -{order.discountAmount.toLocaleString("vi-VN")}₫
            </span>
          </div>
        )}

        <div>
          <strong>Tổng thanh toán:</strong>{" "}
          <span className="text-xl font-bold text-rose-600">
            {(order.finalPrice ?? order.totalPrice).toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Danh sách sản phẩm:</h3>
        <ul className="divide-y divide-gray-200 border rounded-md bg-white">
          {order.orderItems.map((item, index) => {
            const hasDiscount =
              item.originalPrice && item.originalPrice > item.price;
            return (
              <li
                key={index}
                className="flex justify-between items-center px-4 py-4"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    {item.product?.name || "Không có tên sản phẩm"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Màu: {item.color} | Dung lượng: {item.storage}
                  </span>
                  <span className="text-sm text-gray-500">
                    Số lượng: {item.quantity}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-gray-500">
                        Giá gốc:{" "}
                        <span className="line-through">
                          {item.originalPrice.toLocaleString("vi-VN")}₫
                        </span>
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        Đã giảm:{" "}
                        {(item.originalPrice - item.price).toLocaleString(
                          "vi-VN"
                        )}
                        ₫
                      </span>
                    </>
                  )}
                </div>
                <div className="text-right text-gray-700 font-semibold">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
