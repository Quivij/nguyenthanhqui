// src/store/useCartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/api";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // Load giỏ hàng từ backend
      syncCartWithBackend: async () => {
        try {
          const res = await api.get("/cart");
          const items = Array.isArray(res.data?.items) ? res.data.items : [];
          set({ cartItems: items });
        } catch (err) {
          console.error("Không thể load giỏ hàng:", err);
        }
      },

      // Thêm sản phẩm vào giỏ
      addToCart: async (product, variant) => {
        try {
          await api.post("/cart", {
            productId: product._id,
            name: product.name,
            price: variant.price,
            image:
              variant.images?.length > 0
                ? `http://localhost:3001${variant.images[0]}`
                : "default-image.jpg",
            color: variant.color,
            storage: variant.storage,
            quantity: 1,
          });

          await get().syncCartWithBackend();
        } catch (err) {
          console.error("Lỗi khi thêm vào giỏ hàng:", err);
        }
      },

      // Cập nhật số lượng
      updateQuantity: async (productId, color, storage, quantity) => {
        try {
          await api.put("/cart/update", {
            productId,
            color,
            storage,
            quantity: Math.max(1, quantity),
          });

          await get().syncCartWithBackend();
        } catch (err) {
          console.error("Lỗi khi cập nhật số lượng:", err);
        }
      },

      // Xóa sản phẩm
      removeFromCart: async (productId, color, storage) => {
        try {
          await api.delete("/cart/remove", {
            data: { productId, color, storage },
          });

          await get().syncCartWithBackend();
        } catch (err) {
          console.error("Lỗi khi xóa khỏi giỏ hàng:", err);
        }
      },

      // ❗ Xóa nhiều sản phẩm được chọn (đã thanh toán)
      removeMultipleFromCart: async (items) => {
        if (!Array.isArray(items) || items.length === 0) {
          console.warn("Danh sách sản phẩm để xóa không hợp lệ hoặc trống");
          return;
        }

        try {
          // Gửi DELETE request với payload { items }
          await api.delete("/cart/remove-multiple", {
            data: { items },
          });

          // Đồng bộ lại giỏ hàng với backend sau khi xóa
          await get().syncCartWithBackend();

          // Có thể thêm thông báo thành công nếu muốn
          // toast.success("Đã xóa các sản phẩm được chọn khỏi giỏ hàng");
        } catch (err) {
          console.error("Lỗi khi xóa nhiều sản phẩm:", err);
          // Có thể hiện toast lỗi nếu bạn dùng toast
          // toast.error("Lỗi khi xóa nhiều sản phẩm khỏi giỏ hàng");
        }
      },

      // Xóa toàn bộ giỏ hàng
      clearCart: async () => {
        try {
          await api.delete("/cart/clear");
          set({ cartItems: [] });
        } catch (err) {
          console.error("Lỗi khi xóa toàn bộ giỏ hàng:", err);
        }
      },

      // Tính tổng số lượng
      getCartCount: () => {
        const cartItems = get().cartItems;
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
