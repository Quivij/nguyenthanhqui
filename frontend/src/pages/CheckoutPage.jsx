import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { useValidateCoupon } from "../hooks/useValidateCoupon";
import { toast } from "react-toastify";
import AddressSelector from "../components/AddressSelector";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { removeMultipleFromCart } = useCartStore();
  const selectedItems = location.state?.selectedItems || [];

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
  });

  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const finalPrice = totalPrice - discountAmount;

  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutate: validateCoupon } = useValidateCoupon();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = ({ province, district, ward }) => {
    setShippingInfo((prev) => ({
      ...prev,
      city: province.name,
      district: district.name,
      ward: ward.name,
    }));
    setShowAddressPopup(false);
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      return toast.error("Vui lòng nhập mã giảm giá");
    }

    validateCoupon(
      { code: couponCode.trim().toLowerCase(), orderTotal: totalPrice },
      {
        onSuccess: (res) => {
          const coupon = res.coupon;
          if (!coupon) {
            setDiscountAmount(0);
            return toast.error("Mã giảm giá không hợp lệ");
          }

          if (coupon.discountType === "percent") {
            const discount = Math.floor(
              (totalPrice * coupon.discountValue) / 100
            );
            setDiscountAmount(discount);
            toast.success(
              `Giảm ${coupon.discountValue}% (${discount.toLocaleString()}₫)`
            );
          } else if (coupon.discountType === "amount") {
            setDiscountAmount(coupon.discountValue);
            toast.success(`Giảm ${coupon.discountValue.toLocaleString()}₫`);
          } else {
            setDiscountAmount(0);
            toast.error("Loại giảm giá không xác định");
          }
        },
        onError: (err) => {
          setDiscountAmount(0);
          toast.error(
            err?.response?.data?.message || "Mã không hợp lệ hoặc đã hết hạn"
          );
        },
      }
    );
  };

  const handleOrder = () => {
    const orderData = {
      orderItems: selectedItems.map((item) => ({
        product: item.productId,
        color: item.color,
        storage: item.storage,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: shippingInfo,
      paymentMethod,
      totalPrice,
      discountAmount,
      finalPrice,
      couponCode: couponCode.trim(),
    };

    const toastId = toast.loading("Đang xử lý đơn hàng...");

    createOrder(orderData, {
      onSuccess: async () => {
        await removeMultipleFromCart(
          selectedItems.map((item) => ({
            productId: item.productId,
            color: item.color,
            storage: item.storage,
          }))
        );

        toast.update(toastId, {
          render: "Đặt hàng thành công!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        navigate("/orders/my");
      },
      onError: (err) => {
        toast.update(toastId, {
          render:
            err?.response?.data?.message || "Lỗi đặt hàng, vui lòng thử lại.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      },
    });
  };

  if (selectedItems.length === 0) {
    toast.error("Không có sản phẩm được chọn để thanh toán.");
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Sản phẩm đã chọn</h2>

      <div className="space-y-4 mb-6">
        {selectedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border p-3 rounded-lg shadow-sm"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">
                Màu: {item.color} | Dung lượng: {item.storage}
              </p>
              <p className="text-sm">
                Số lượng: {item.quantity} | Giá:{" "}
                <span className="text-red-600">
                  {(item.price * item.quantity).toLocaleString()}₫
                </span>
              </p>
            </div>
            <img
              src={item.image || "/default-image.jpg"}
              alt={item.name}
              className="w-16 h-16 object-cover rounded border"
            />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>

      {["fullName", "phone", "address"].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={
            field === "fullName"
              ? "Họ và tên"
              : field === "phone"
              ? "Số điện thoại"
              : "Địa chỉ chi tiết"
          }
          value={shippingInfo[field]}
          onChange={handleInputChange}
          className="w-full border p-2 mb-2 rounded"
        />
      ))}

      <div className="mb-2">
        <button
          onClick={() => setShowAddressPopup(true)}
          className="w-full border p-2 rounded bg-blue-100 hover:bg-blue-200"
        >
          {shippingInfo.ward
            ? `${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`
            : "Chọn địa chỉ (Tỉnh/TP, Quận/Huyện, Phường/Xã)"}
        </button>
      </div>

      {showAddressPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-[90%] max-w-4xl relative">
            <button
              onClick={() => setShowAddressPopup(false)}
              className="absolute top-2 right-3 text-gray-600 text-xl hover:text-black"
            >
              ×
            </button>
            <AddressSelector onSelect={handleAddressSelect} />
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="font-medium">Phương thức thanh toán:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="block w-full border p-2 mt-1 rounded"
        >
          <option value="COD">Thanh toán khi nhận hàng</option>
          <option value="Momo">Momo</option>
          <option value="BankTransfer">Chuyển khoản</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="font-medium">Mã giảm giá:</label>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Nhập mã giảm giá"
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={applyCoupon}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Áp dụng
          </button>
        </div>
      </div>

      <div className="text-lg mb-2">
        Tổng tiền:{" "}
        <span className="font-medium">{totalPrice.toLocaleString()}₫</span>
      </div>

      {discountAmount > 0 && (
        <div className="text-green-600 mb-2">
          Giảm giá: -{discountAmount.toLocaleString()}₫
        </div>
      )}

      <div className="font-bold text-xl mb-4">
        Thanh toán: {finalPrice.toLocaleString()}₫
      </div>

      <button
        onClick={handleOrder}
        disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Đang xử lý..." : "Đặt hàng"}
      </button>
    </div>
  );
};

export default CheckoutPage;
