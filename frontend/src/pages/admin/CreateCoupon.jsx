import { useState } from "react";
import { useCreateCoupon } from "../../hooks/useCreateCoupon";
import { toast } from "react-toastify";

export default function CreateCoupon() {
  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderValue: "",
    expireDate: "",
  });

  const { mutate, isLoading } = useCreateCoupon();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc
    if (!form.code.trim()) {
      toast.error("Vui lòng nhập mã khuyến mãi.");
      return;
    }
    if (!form.discountValue || form.discountValue <= 0) {
      toast.error("Giá trị giảm phải lớn hơn 0.");
      return;
    }
    if (!form.expireDate) {
      toast.error("Vui lòng chọn ngày hết hạn.");
      return;
    }

    mutate(form, {
      onSuccess: () => {
        toast.success("Tạo mã khuyến mãi thành công!");
        setForm({
          code: "",
          discountType: "percent",
          discountValue: "",
          minOrderValue: "",
          expireDate: "",
        });
        // Nếu muốn chuyển trang sau 1.5s
        // setTimeout(() => navigate("/admin/coupons"), 1500);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!"
        );
      },
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center">Tạo mã khuyến mãi</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="code"
          placeholder="Mã khuyến mãi"
          className="input input-bordered w-full"
          value={form.code}
          onChange={handleChange}
          required
          autoFocus
        />
        <select
          name="discountType"
          className="input input-bordered w-full"
          value={form.discountType}
          onChange={handleChange}
        >
          <option value="percent">Phần trăm (%)</option>
          <option value="amount">Số tiền cố định (vnđ)</option>
        </select>
        <input
          type="number"
          name="discountValue"
          placeholder="Giá trị giảm"
          className="input input-bordered w-full"
          value={form.discountValue}
          onChange={handleChange}
          min={1}
          required
        />
        <input
          type="number"
          name="minOrderValue"
          placeholder="Đơn tối thiểu (không bắt buộc)"
          className="input input-bordered w-full"
          value={form.minOrderValue}
          onChange={handleChange}
          min={0}
        />
        <input
          type="date"
          name="expireDate"
          className="input input-bordered w-full"
          value={form.expireDate}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Đang tạo..." : "Tạo mã"}
        </button>
      </form>
    </div>
  );
}
