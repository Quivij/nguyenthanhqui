import React, { useEffect, useState } from "react";
import { useFetchProfile } from "../hooks/useFetchProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useUserStore } from "../store/useUserStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ChangePasswordModal from "../components/ChangePasswordModal"; // 1. IMPORT COMPONENT MODAL

const ProfilePage = () => {
  const { setUser, user } = useUserStore();
  const { data: profileData, isLoading, isError } = useFetchProfile();
  const { mutate, isLoading: isUpdating } = useUpdateProfile();
  // const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: null,
  });

  // 2. THÊM STATE ĐỂ QUẢN LÝ MODAL
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (profileData) {
      const { name, email, phone, address, avatar } = profileData;
      setFormData({ name, email, phone, address, avatar });
      setAvatarPreview(avatar ? `http://localhost:3001${avatar}` : "");
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarClick = () => {
    document.getElementById("avatar-input").click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = new FormData();
    updatedData.append("name", formData.name);
    updatedData.append("email", formData.email);
    updatedData.append("phone", formData.phone);
    updatedData.append("address", formData.address);

    if (formData.avatar instanceof File) {
      updatedData.append("avatar", formData.avatar);
    }

    mutate(updatedData, {
      onSuccess: (data) => {
        const avatarUrl = data.user.avatar?.startsWith("http")
          ? data.user.avatar
          : data.user.avatar
          ? `http://localhost:3001${data.user.avatar}?t=${Date.now()}`
          : avatarPreview;

        const updatedUser = {
          ...user,
          ...data.user,
          avatar: avatarUrl,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success("Cập nhật thông tin thành công!");
        // Bạn có thể không cần navigate đi chỗ khác để người dùng thấy thông tin đã được cập nhật
        // navigate("/");
      },
      onError: () => {
        toast.error("Cập nhật thông tin thất bại, thử lại!");
      },
    });
  };

  if (isLoading)
    return <div className="text-center mt-10">Đang tải thông tin...</div>;
  if (isError)
    return (
      <div className="text-center mt-10 text-red-500">
        Lỗi tải thông tin. Vui lòng thử lại sau!
      </div>
    );

  const formFields = [
    { label: "Họ và tên", name: "name", type: "text", autoFocus: true },
    { label: "Email", name: "email", type: "email" },
    { label: "Số điện thoại", name: "phone", type: "text" },
    { label: "Địa chỉ", name: "address", type: "text" },
  ];

  return (
    <>
      {" "}
      {/* Sử dụng Fragment để bao bọc component và modal */}
      <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Thông tin cá nhân
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div
            onClick={handleAvatarClick}
            className="flex justify-center mb-4 cursor-pointer"
            title="Nhấn để đổi ảnh đại diện"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-white text-2xl mx-auto border-4 border-gray-200 shadow-sm">
                {formData.name ? (
                  formData.name.charAt(0).toUpperCase()
                ) : (
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="text-4xl text-gray-500"
                  />
                )}
              </div>
            )}
          </div>

          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Input Fields */}
          {formFields.map(({ label, name, type, autoFocus }) => (
            <div key={name}>
              <label className="block mb-1 font-medium text-gray-700">
                {label}:
              </label>
              <input
                type={type}
                name={name}
                value={formData[name] || ""}
                onChange={handleChange}
                placeholder={`Nhập ${label.toLowerCase()}`}
                autoFocus={autoFocus}
                className="w-full border rounded px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isUpdating}
            className={`w-full py-2 rounded text-white font-semibold transition-colors ${
              isUpdating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </form>

        {/* 3. NÚT ĐỂ MỞ MODAL */}
        <div className="text-center mt-6 border-t pt-4">
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="text-sm text-blue-600 hover:underline focus:outline-none"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
      {/* 4. RENDER MODAL DỰA TRÊN STATE */}
      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </>
  );
};

export default ProfilePage;
