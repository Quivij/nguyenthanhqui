import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { DateTime } from "luxon";

// --- Helper Functions ---

function formatChartData(statsData, intervals, view, dataKeys) {
  const chartData = [];
  const now = DateTime.now().setZone("Asia/Ho_Chi_Minh");

  for (let i = intervals - 1; i >= 0; i--) {
    let date = now;

    if (view === "day") {
      date = now.minus({ days: i });
    } else if (view === "week") {
      date = now.minus({ weeks: i });
    } else {
      date = now.minus({ months: i });
    }

    let name = "";
    let matchCondition = () => false;

    if (view === "day") {
      name = `${date.day}/${date.month}`;
      matchCondition = (item) =>
        item._id.day === date.day &&
        item._id.month === date.month &&
        item._id.year === date.year;
    } else if (view === "week") {
      name = `Tuần ${date.weekNumber}`;
      matchCondition = (item) =>
        item._id.week === date.weekNumber && item._id.year === date.weekYear;
    } else {
      name = `Tháng ${date.month}`;
      matchCondition = (item) =>
        item._id.month === date.month && item._id.year === date.year;
    }

    const found = statsData.find(matchCondition);
    const dataPoint = { name };

    dataKeys.forEach((key) => {
      dataPoint[key.keyInChart] = found ? found[key.keyInDb] : 0;
    });

    chartData.push(dataPoint);
  }

  return chartData;
}

// --- Main Controller ---

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // Tổng quan
    const [totalUsers, totalOrders, totalProducts, revenueAgg, discountAgg] =
      await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          {
            $group: {
              _id: null,
              totalDiscount: { $sum: "$discountAmount" },
            },
          },
        ]),
      ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const totalDiscount = discountAgg[0]?.totalDiscount || 0;

    // Mốc thời gian
    const last7Days = DateTime.now()
      .setZone("Asia/Ho_Chi_Minh")
      .minus({ days: 6 })
      .toJSDate();
    const last6Weeks = DateTime.now()
      .setZone("Asia/Ho_Chi_Minh")
      .minus({ weeks: 6 })
      .toJSDate();
    const last6Months = DateTime.now()
      .setZone("Asia/Ho_Chi_Minh")
      .minus({ months: 6 })
      .toJSDate();

    // GroupId có timezone
    const dayGroupId = {
      $dateToParts: {
        date: "$createdAt",
        timezone: "Asia/Ho_Chi_Minh",
      },
    };

    const weekGroupId = {
      week: {
        $isoWeek: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" },
      },
      year: {
        $isoWeekYear: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" },
      },
    };

    const monthGroupId = {
      month: { $month: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } },
      year: { $year: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } },
    };

    // Pipeline doanh thu
    const createRevenuePipeline = (startDate, groupId) => [
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: groupId,
          totalRevenue: { $sum: "$totalPrice" },
          totalDiscount: { $sum: "$discountAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1 } },
    ];

    // Pipeline sản phẩm
    const createProductPipeline = (startDate, groupId) => [
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "Cancelled" },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: groupId,
          totalQuantity: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1 } },
    ];

    // Gọi các pipeline
    const [
      revenueByDay,
      revenueByWeek,
      revenueByMonth,
      productsByDay,
      productsByWeek,
      productsByMonth,
    ] = await Promise.all([
      Order.aggregate(createRevenuePipeline(last7Days, dayGroupId)),
      Order.aggregate(createRevenuePipeline(last6Weeks, weekGroupId)),
      Order.aggregate(createRevenuePipeline(last6Months, monthGroupId)),
      Order.aggregate(createProductPipeline(last7Days, dayGroupId)),
      Order.aggregate(createProductPipeline(last6Weeks, weekGroupId)),
      Order.aggregate(createProductPipeline(last6Months, monthGroupId)),
    ]);

    // Định nghĩa keys
    const revenueKeys = [
      { keyInDb: "totalRevenue", keyInChart: "doanhThu" },
      { keyInDb: "totalDiscount", keyInChart: "discount" },
    ];
    const productKeys = [{ keyInDb: "totalQuantity", keyInChart: "soLuong" }];

    // Format dữ liệu biểu đồ
    const formattedRevenueByDay = formatChartData(
      revenueByDay,
      7,
      "day",
      revenueKeys
    );
    const formattedRevenueByWeek = formatChartData(
      revenueByWeek,
      6,
      "week",
      revenueKeys
    );
    const formattedRevenueByMonth = formatChartData(
      revenueByMonth,
      6,
      "month",
      revenueKeys
    );
    const formattedProductsByDay = formatChartData(
      productsByDay,
      7,
      "day",
      productKeys
    );
    const formattedProductsByWeek = formatChartData(
      productsByWeek,
      6,
      "week",
      productKeys
    );
    const formattedProductsByMonth = formatChartData(
      productsByMonth,
      6,
      "month",
      productKeys
    );

    // Trả về kết quả
    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      totalDiscount,
      totalProducts,
      chartData: {
        byDay: formattedRevenueByDay,
        byWeek: formattedRevenueByWeek,
        byMonth: formattedRevenueByMonth,
        productsByDay: formattedProductsByDay,
        productsByWeek: formattedProductsByWeek,
        productsByMonth: formattedProductsByMonth,
      },
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy thống kê" });
  }
};
