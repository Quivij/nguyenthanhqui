import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../../components/card";
import { Users, ShoppingCart, DollarSign, Package } from "lucide-react";

// Giả lập token
const fakeToken = "your-jwt-token-here";

const Dashboard = () => {
  const [selectedRevenueView, setSelectedRevenueView] = useState("month");
  const [selectedProductView, setSelectedProductView] = useState("month");
  const navigate = useNavigate();

  // GỌI HOOK ĐÃ CẬP NHẬT: Chỉ cần truyền token, không cần view.
  const { data, isLoading, isError } = useDashboardStats(fakeToken);

  // Hàm lấy dữ liệu cho biểu đồ Doanh thu (Không cần thay đổi)
  const getRevenueChartData = () => {
    if (!data?.chartData) return [];
    const raw =
      selectedRevenueView === "month"
        ? data.chartData.byMonth
        : selectedRevenueView === "week"
        ? data.chartData.byWeek
        : data.chartData.byDay;

    return (
      raw?.map((item) => ({
        ...item,
        doanhThuDaGiam: item.doanhThu - (item.discount || 0),
      })) ?? []
    );
  };

  // Hàm lấy dữ liệu cho biểu đồ Sản phẩm (Không cần thay đổi)
  const getProductChartData = () => {
    if (!data?.chartData) return [];
    const raw =
      selectedProductView === "month"
        ? data.chartData.productsByMonth
        : selectedProductView === "week"
        ? data.chartData.productsByWeek
        : data.chartData.productsByDay;

    return raw ?? [];
  };

  const revenueChartData = getRevenueChartData();
  const productChartData = getProductChartData();

  const stats = [
    {
      title: "Người dùng",
      value: data?.totalUsers ?? 0,
      icon: <Users className="text-blue-600" />,
      bg: "bg-blue-100",
      path: "/admin/users",
    },
    {
      title: "Đơn hàng",
      value: data?.totalOrders ?? 0,
      icon: <ShoppingCart className="text-green-600" />,
      bg: "bg-green-100",
      path: "/admin/orders",
    },
    {
      title: "Doanh thu",
      value: (
        <div className="text-gray-800 font-bold text-lg">
          <div>
            <span className="mr-2 text-sm text-gray-500">Thực tế:</span>
            <span>
              {(
                (data?.totalRevenue ?? 0) - (data?.totalDiscount ?? 0)
              ).toLocaleString("vi-VN")}
              ₫
            </span>
          </div>
          <div>
            <span className="mr-2 text-sm text-gray-500">Tổng:</span>
            <span>{(data?.totalRevenue ?? 0).toLocaleString("vi-VN")}₫</span>
          </div>
        </div>
      ),
      icon: <DollarSign className="text-yellow-600" />,
      bg: "bg-yellow-100",
      path: "/admin/orders",
    },
    {
      title: "Sản phẩm",
      value: data?.totalProducts ?? 0,
      icon: <Package className="text-purple-600" />,
      bg: "bg-purple-100",
      path: "/admin/products",
    },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800">
        📊 Dashboard Quản Trị
      </h1>

      {isLoading ? (
        <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
      ) : isError ? (
        <p className="text-red-500">
          Không thể tải dữ liệu thống kê. Vui lòng thử lại.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((item, index) => (
              <Card
                key={index}
                onClick={() => item.path && navigate(item.path)}
                className={`cursor-pointer p-5 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg transition ${item.bg}`}
              >
                <div className="p-3 bg-white rounded-full shadow">
                  <div className="text-3xl">{item.icon}</div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{item.title}</p>
                  <div className="text-2xl font-bold text-gray-800">
                    {item.value}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Biểu đồ Doanh thu */}
          <Card className="p-6 mt-8 rounded-2xl shadow-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                📈 Doanh thu theo{" "}
                {selectedRevenueView === "month"
                  ? "tháng"
                  : selectedRevenueView === "week"
                  ? "tuần"
                  : "ngày"}
              </h2>
              <select
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedRevenueView}
                onChange={(e) => setSelectedRevenueView(e.target.value)}
              >
                <option value="month">Theo tháng</option>
                <option value="week">Theo tuần</option>
                <option value="day">Theo ngày</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 1_000_000) return `${value / 1_000_000}tr`;
                    if (value >= 1_000) return `${value / 1_000}k`;
                    return value;
                  }}
                  width={80}
                  label={{ value: "VNĐ", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString("vi-VN")}₫`}
                />
                <Legend />
                <Bar
                  dataKey="doanhThu"
                  name="Doanh thu tổng"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="doanhThuDaGiam"
                  name="Doanh thu thực tế"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Biểu đồ Sản phẩm đã bán */}
          <Card className="p-6 mt-8 rounded-2xl shadow-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                📦 Sản phẩm đã bán theo{" "}
                {selectedProductView === "month"
                  ? "tháng"
                  : selectedProductView === "week"
                  ? "tuần"
                  : "ngày"}
              </h2>
              <select
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedProductView}
                onChange={(e) => setSelectedProductView(e.target.value)}
              >
                <option value="month">Theo tháng</option>
                <option value="week">Theo tuần</option>
                <option value="day">Theo ngày</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  allowDecimals={false}
                  width={40}
                  label={{
                    value: "Số lượng",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} sản phẩm`, "Số lượng bán"]}
                />
                <Legend />
                <Bar
                  dataKey="soLuong"
                  name="Số lượng sản phẩm đã bán"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
