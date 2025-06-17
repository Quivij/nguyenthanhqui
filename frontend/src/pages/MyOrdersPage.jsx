import React from "react";
import { useNavigate } from "react-router-dom";
import { useMyOrders } from "../hooks/useMyOrders";
import { format } from "date-fns";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isError, error } = useMyOrders();

  if (isLoading) {
    return <div className="text-center py-4">Đang tải đơn hàng...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-4 text-red-500">
        Lỗi khi tải danh sách đơn hàng: {error?.message}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Đơn hàng của bạn</h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">Bạn chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-lg shadow-md mb-6 bg-white p-5"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-lg font-semibold">
                  Đơn hàng #{order._id.slice(-6).toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">
                  Ngày tạo:{" "}
                  {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm">
                  Thanh toán:{" "}
                  <span
                    className={`inline-block px-2 py-1 rounded text-white text-xs ${
                      order.paymentStatus === "paid"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {order.paymentStatus === "paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </span>
                </div>
                <div className="text-sm">
                  Trạng thái:{" "}
                  <span
                    className={`inline-block px-2 py-1 rounded text-white text-xs ${
                      order.isDelivered ? "bg-green-600" : "bg-gray-400"
                    }`}
                  >
                    {order.isDelivered ? "Đã giao hàng" : "Chưa giao"}
                  </span>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm trong đơn */}
            <div className="border-t pt-3 mt-3">
              {order.orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center mb-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.product?.name || "Sản phẩm"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Màu: {item.color} | Dung lượng: {item.storage}
                    </div>
                  </div>
                  <div className="text-sm font-medium">x{item.quantity}</div>
                </div>
              ))}
            </div>

            {/* Hiển thị giá giảm và tổng tiền */}
            <div className="mt-3 text-right space-y-1">
              {order.discountAmount > 0 && (
                <div className="text-green-600">
                  Giảm giá: -{order.discountAmount.toLocaleString()}₫
                </div>
              )}
              <div className="font-semibold text-lg text-blue-700">
                Thanh toán:{" "}
                {(order.finalPrice ?? order.totalPrice).toLocaleString()}₫
              </div>
            </div>

            <div className="mt-3 text-right">
              <button
                onClick={() => navigate(`/orders/${order._id}`)}
                className="inline-block px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrdersPage;
