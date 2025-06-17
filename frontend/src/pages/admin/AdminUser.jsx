import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAllUsers, deleteUserById } from "../../api/auth";
import { useMutationHook } from "../../hooks/useMutationHook";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import { toast } from "react-toastify";
import { useDebounce } from "../../hooks/useDebounce";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackButton from '../../components/BackButton';

const AdminUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users", debouncedSearch, page],
    queryFn: () =>
      getAllUsers({
        search: debouncedSearch,
        page: 1,
        limit: 10000,
      }),
    keepPreviousData: true,
  });

  const users = data?.users || [];

  const deleteMutation = useMutationHook(deleteUserById, {
    onSuccess: () => {
      toast.success("Xoá người dùng thành công");
      refetch();
    },
    onError: () => {
      toast.error("Xoá thất bại");
    },
  });

  const handleDelete = (id) => {
    setSelectedUser(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedUser);
    setIsConfirmOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleExportExcel = () => {
    if (!users || users.length === 0) {
      toast.info("Không có dữ liệu người dùng để xuất");
      return;
    }

    const formattedUsers = users.map((user, index) => ({
      STT: index + 1,
      "Họ tên": user.name,
      Email: user.email,
      "Số điện thoại": user.phone || "—",
      "Vai trò": user.isAdmin ? "Admin" : "Người dùng",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách người dùng");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "danh_sach_nguoi_dung.xlsx");
  };

  if (isLoading) return <p>Đang tải dữ liệu...</p>;
  if (isError) return <p>Đã xảy ra lỗi khi tải người dùng</p>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Link
          to="/admin/users/create"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Thêm người dùng
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm tên hoặc email..."
          className="border p-2 rounded-md w-full sm:w-1/3"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="flex items-center mb-4">
        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Xuất Excel
        </button>
      </div>

      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100 text-sm font-semibold text-gray-700">
            <tr>
              {/* Bỏ cột checkbox */}
              <th className="p-3 border">Tên</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">SĐT</th>
              <th className="p-3 border">Vai trò</th>
              <th className="p-3 border text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {users.map((u) => (
              <tr key={u._id} className="border-t hover:bg-gray-50">
                {/* Bỏ checkbox chọn */}
                <td className="p-3 border">{u.name}</td>
                <td className="p-3 border">{u.email}</td>
                <td className="p-3 border">{u.phone || "—"}</td>
                <td className="p-3 border capitalize">
                  {u.isAdmin ? "Admin" : "Người dùng"}
                </td>
                <td className="p-3 border">
                  <div className="flex justify-center gap-2">
                    <Link
                      to={`/admin/users/edit/${u._id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="Sửa"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Xoá"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xoá"
        message="Bạn có chắc chắn muốn xoá người dùng này không?"
      />
    </div>
  );
};

export default AdminUser;
