import { useEffect, useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, syncCartWithBackend } =
    useCartStore();

  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    syncCartWithBackend();
  }, [syncCartWithBackend]);

  const toggleSelect = (item) => {
    const exists = selectedItems.some(
      (i) =>
        i.productId === item.productId &&
        i.color === item.color &&
        i.storage === item.storage
    );
    if (exists) {
      setSelectedItems((prev) =>
        prev.filter(
          (i) =>
            !(
              i.productId === item.productId &&
              i.color === item.color &&
              i.storage === item.storage
            )
        )
      );
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning("⚠️ Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    // Điều hướng và truyền sản phẩm đã chọn
    navigate("/checkout", { state: { selectedItems } });
  };

  const handleIncrease = (item) => {
    updateQuantity(item.productId, item.color, item.storage, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(
        item.productId,
        item.color,
        item.storage,
        item.quantity - 1
      );
    }
  };

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">🛒 Giỏ hàng trống</h1>
        <Link to = "/" className="text-gray-600 text-lg">
          Hãy thêm sản phẩm vào giỏ hàng của bạn.
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">🛒 Giỏ hàng của bạn</h1>
      <div className="space-y-6">
        {cartItems.map((item, index) => {
          const isSelected = selectedItems.some(
            (i) =>
              i.productId === item.productId &&
              i.color === item.color &&
              i.storage === item.storage
          );

          return (
            <div
              key={index}
              className="flex items-center border p-4 rounded-2xl shadow-md gap-6 bg-white"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(item)}
                className="w-5 h-5"
              />

              <img
                src={item.image || "/default-image.jpg"}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg border"
                onError={(e) => (e.target.src = "/default-image.jpg")}
              />

              <div className="flex-1">
                <h2 className="font-semibold text-lg">
                  {item.name} Chính hãng VN/A
                </h2>
                <p className="text-sm text-gray-600">
                  Màu: {item.color} | Dung lượng: {item.storage}
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-lg"
                    >
                      −
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-lg"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-red-500 font-bold">
                    {(item.price * item.quantity).toLocaleString()}₫
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  removeFromCart(item.productId, item.color, item.storage)
                }
                className="text-red-500 font-semibold hover:underline"
              >
                Xóa
              </button>
            </div>
          );
        })}

        <div className="text-right text-xl font-bold mt-6">
          Tổng tiền đã chọn:{" "}
          <span className="text-red-500">{totalPrice.toLocaleString()}₫</span>
        </div>

        <div className="text-right mt-6">
          <button
            onClick={handleCheckout}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl font-semibold transition duration-200"
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
