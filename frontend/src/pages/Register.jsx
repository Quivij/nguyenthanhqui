import { useState } from "react";
import { Link } from "react-router-dom";
import { InputField } from "../components/InputField";
import { Button } from "../components/Button";
import { useRegister } from "../hooks/useRegister";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { loading, error, successMessage, handleRegister } = useRegister();

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Họ và tên không được để trống.";
    if (!email.trim()) newErrors.email = "Email không được để trống.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email không hợp lệ.";
    if (!password) newErrors.password = "Mật khẩu không được để trống.";
    if (!confirmPassword)
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    if (password && confirmPassword && password !== confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    if (password.length < 6) return "Yếu";
    if (
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.length >= 8
    )
      return "Mạnh";
    return "Trung bình";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await handleRegister({
      name,
      email,
      password,
      confirmPassword,
    });
    if (success) {
      toast.success("Đăng ký thành công!");
      setTimeout(() => {
        navigate("/login"); // Điều hướng sang trang đăng nhập
      }, 6000);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    } else {
      toast.error(error || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Đăng Ký
        </h2>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-sm mt-2">{successMessage}</p>
        )}

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <InputField
              label="Họ và tên"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="relative">
            <InputField
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
            <div
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            {password && (
              <p className="text-sm mt-1 text-gray-600">
                Độ mạnh mật khẩu:{" "}
                <span className="font-medium">{getPasswordStrength()}</span>
              </p>
            )}
          </div>

          <div className="relative">
            <InputField
              label="Xác nhận mật khẩu"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
            />
            {confirmPassword && (
              <p
                className={`text-sm mt-1 ${
                  confirmPassword === password
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {confirmPassword === password
                  ? "Mật khẩu khớp"
                  : "Mật khẩu không khớp"}
              </p>
            )}

            <div
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            text={loading ? "Đang xử lý..." : "Đăng Ký"}
            disabled={loading}
          />
        </form>

        <p className="mt-4 text-center text-gray-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-500">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
