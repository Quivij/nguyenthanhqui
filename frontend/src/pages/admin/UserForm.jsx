import { useState } from "react";

const UserForm = ({ initialValues = {}, onSubmit, isEdit }) => {
  const [form, setForm] = useState({
    name: initialValues.name || "",
    email: initialValues.email || "",
    phone: initialValues.phone || "",
    address: initialValues.address || "",
    avatar: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setForm({ ...form, avatar: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in form) {
      if (key === "avatar" && form[key]) {
        formData.append("avatar", form[key]);
      } else {
        formData.append(key, form[key]);
      }
    }
    onSubmit(formData); // Gọi hàm onSubmit khi form được gửi
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {["name", "email", "phone", "address"].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      ))}

      <div>
        <label className="block text-sm font-medium">Avatar</label>
        <input
          type="file"
          onChange={handleImageChange}
          className="border p-2 rounded"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        {isEdit ? "Cập nhật" : "Tạo mới"} người dùng
      </button>
    </form>
  );
};

export default UserForm;
