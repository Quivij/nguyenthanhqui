import { create } from "zustand";
import { persist } from "zustand/middleware";

// Store để lưu thông tin người dùng
export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false, // ✅ Thêm flag check hydration
      setUser: (userData) => set({ user: userData }),
      clearUser: () => set({ user: null }),
      setHasHydrated: (state) => set({ hasHydrated: state }), // ✅ Thêm hàm cập nhật hydration
      logout: () => {
        // Clear user data
        set({ user: null });
        // Clear any stored tokens
        localStorage.removeItem('token');
      },
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true); // ✅ Update flag khi rehydrate xong
      },
    }
  )
);

// Nếu cần phải tạo Provider, nhưng trong trường hợp này không cần thiết
export const UserProvider = ({ children }) => {
  return children;
};