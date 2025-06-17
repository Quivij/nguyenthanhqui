import { useState } from "react";
import { registerUser } from "../api/auth";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async ({ name, email, password, confirmPassword }) => {
    setError("");
    setSuccessMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        name,
        email,
        password,
        confirmPassword,
      });
      setSuccessMessage(data.message);
      return true; // báo về thành công
    } catch (err) {
      if (!err.response) {
        setError("Không thể kết nối tới máy chủ");
      } else {
        setError(err.response?.data?.message || "Đăng ký thất bại");
      }
    } finally {
      setLoading(false);
    }

    return false; // báo về thất bại
  };

  return { loading, error, successMessage, handleRegister };
};
