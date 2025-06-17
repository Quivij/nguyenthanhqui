import { useGetCoupons } from "../../hooks/useGetCoupons";
import { useDeleteCoupon } from "../../hooks/useDeleteCoupon";
import { useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import BackButton from '../../components/BackButton';

export default function CouponList() {
  const { data: coupons = [], isLoading, isError, refetch } = useGetCoupons();
  const { mutate: deleteCoupon } = useDeleteCoupon();

  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = (id) => {
    setSelectedCouponId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteCoupon(selectedCouponId, {
      onSuccess: () => {
        toast.success("Xóa mã khuyến mãi thành công!");
        refetch();
      },
      onError: () => {
        toast.error("Xóa mã thất bại!");
      },
    });
    setIsConfirmOpen(false);
  };

  if (isLoading) return <p>Đang tải mã khuyến mãi...</p>;
  if (isError) return <p>Lỗi khi tải mã khuyến mãi.</p>;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Quản lý mã giảm giá</h1>
        <BackButton />
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold mb-2">Danh sách mã khuyến mãi</h2>

        <div className="flex justify-end mb-4">
          <Link
            to="/admin/coupons/create"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Tạo mã giảm giá
          </Link>
        </div>

        <div className="overflow-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3 border">Mã</th>
                <th className="p-3 border">Loại</th>
                <th className="p-3 border">Giá trị</th>
                <th className="p-3 border">Hạn</th>
                <th className="p-3 border text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 border">{c.code}</td>
                  <td className="p-3 border">
                    {c.discountType === "percent" ? "Phần trăm" : "Tiền mặt"}
                  </td>
                  <td className="p-3 border">
                    {c.discountType === "percent"
                      ? `${c.discountValue}%`
                      : `${c.discountValue.toLocaleString()}đ`}
                  </td>
                  <td className="p-3 border">
                    {new Date(c.expireDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Xoá"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Xác nhận xoá"
          message="Bạn có chắc chắn muốn xoá mã khuyến mãi này không?"
        />
      </div>
    </div>
  );
}
