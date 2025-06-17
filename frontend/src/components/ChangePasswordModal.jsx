import React, { useState } from "react";
import { useChangePassword } from "../hooks/useChangePassword";
import { toast } from "react-toastify";

const ChangePasswordModal = ({ onClose }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { mutate: changePassword, isLoading } = useChangePassword();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Mật khẩu mới và mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    changePassword(passwords, {
      onSuccess: () => {
        toast.success("Đổi mật khẩu thành công!");
        onClose();
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.message ||
          "Đổi mật khẩu thất bại, vui lòng thử lại!";
        toast.error(errorMessage);
      },
    });
  };

  return (
    // Lớp phủ (Overlay) cho modal - ĐÃ XÓA NỀN ĐEN
    <div className="fixed inset-0 flex justify-center items-center z-50 transition-opacity">
      {/* Nội dung modal */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in-up">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Đổi mật khẩu</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Các nút hành động */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
