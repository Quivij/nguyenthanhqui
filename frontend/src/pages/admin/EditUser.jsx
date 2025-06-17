import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import UserForm from "./UserForm"; // Bạn cần tạo một form cho người dùng (giống ProductForm)
import { useMutationHook } from "../../hooks/useMutationHook";
import { toast } from "react-toastify";
import { getUserById, updateUserById } from "../../api/auth"; // Import API của bạn

const EditUser = () => {
  const { id } = useParams(); // Lấy ID người dùng từ URL

  // Dùng query để lấy dữ liệu người dùng theo ID
  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id), // Lấy thông tin người dùng theo ID
  });

  // Cấu hình mutation để cập nhật người dùng
  const mutation = useMutationHook(
    (formData) => updateUserById(id, formData), // Gửi API cập nhật thông tin
    {
      onSuccess: () => toast.success("Cập nhật thành công"), // Thông báo thành công
      onError: () => toast.error("Lỗi cập nhật"), // Thông báo lỗi
    }
  );

  // Nếu dữ liệu đang được tải, hiển thị loading
  if (isLoading) return <p>Đang tải...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Chỉnh sửa người dùng</h1>
      <UserForm
        onSubmit={mutation.mutate}
        initialValues={data} // Truyền dữ liệu ban đầu vào form
        isEdit
      />
    </div>
  );
};

export default EditUser;
