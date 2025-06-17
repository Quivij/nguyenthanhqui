import { useState } from "react";
import { useMutationHook } from "../../hooks/useMutationHook";
import { createUser } from "../../api/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    isAdmin: false,
  });

  const { mutate, isLoading } = useMutationHook(createUser, {
    onSuccess: () => {
      toast.success("Tạo người dùng thành công");
      navigate("/admin/users");
    },
    onError: () => {
      toast.error("Tạo người dùng thất bại");
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Tạo người dùng mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Tên"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="phone"
          type="text"
          placeholder="Số điện thoại"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="address"
          type="text"
          placeholder="Địa chỉ"
          value={formData.address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isAdmin"
            checked={formData.isAdmin}
            onChange={handleChange}
          />
          <span>Là Admin?</span>
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Đang tạo..." : "Tạo người dùng"}
        </button>
      </form>
    </div>
  );
};

export default CreateUserPage;
