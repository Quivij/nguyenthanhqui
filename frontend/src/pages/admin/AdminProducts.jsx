import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAllProducts, deleteProductById } from "../../api/product";
import { useMutationHook } from "../../hooks/useMutationHook";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import { toast } from "react-toastify";
import { useDebounce } from "../../hooks/useDebounce";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackButton from "../../components/BackButton";

const AdminProduct = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-products", debouncedSearch, page],
    queryFn: () =>
      getAllProducts({
        search: debouncedSearch,
        page: 1,
        limit: 10000,
      }),
    keepPreviousData: true,
  });

  const products = data?.products || [];

  const deleteMutation = useMutationHook(deleteProductById, {
    onSuccess: () => {
      toast.success("Xoá sản phẩm thành công");
      refetch();
    },
    onError: () => {
      toast.error("Xoá thất bại");
    },
  });

  const handleDelete = (id) => {
    setSelectedProduct(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedProduct);
    setIsConfirmOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleExportExcel = () => {
    if (!products || products.length === 0) {
      toast.info("Không có dữ liệu sản phẩm để xuất");
      return;
    }

    const formattedProducts = products.flatMap((product) =>
      product.variants.map((variant) => ({
        "Tên sản phẩm": product.name,
        "Màu sắc": variant.color,
        "Dung lượng": variant.storage,
        "Giá nhập kho": variant.importPrice
          ? variant.importPrice.toLocaleString("vi-VN") + "₫"
          : "Chưa có",
        "Giá bán": variant.price
          ? variant.price.toLocaleString("vi-VN") + "₫"
          : "Chưa có",
        "Tồn kho": variant.stock,
        "Đã bán": variant.sold || 0,
        "Thương hiệu": product.brand,
        "Ngày tạo": product.createdAt
          ? new Date(product.createdAt).toLocaleDateString("vi-VN")
          : "Chưa có",
        "Ngày cập nhật": product.updatedAt
          ? new Date(product.updatedAt).toLocaleDateString("vi-VN")
          : "Chưa có",
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách sản phẩm");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "danh_sach_san_pham.xlsx");
  };

  if (isLoading) return <p>Đang tải dữ liệu...</p>;
  if (isError) return <p>Đã xảy ra lỗi khi tải sản phẩm</p>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Link
          to="/admin/products/create"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm tên sản phẩm..."
          className="border p-2 rounded-md w-full sm:w-1/3"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
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
              <th className="p-3 border">Tên sản phẩm</th>
              <th className="p-3 border">Giá nhập kho</th>
              <th className="p-3 border">Giá</th>
              <th className="p-3 border">Tồn kho</th>
              <th className="p-3 border">Đã bán</th>
              <th className="p-3 border">Còn hàng</th>
              <th className="p-3 border">Ngày tạo</th>
              <th className="p-3 border">Ngày cập nhật</th>
              <th className="p-3 border text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {products.map((product) => (
              <tr key={product._id} className="border-t hover:bg-gray-50">
                <td className="p-3 border">{product.name}</td>
                <td className="p-3 border">
                  {product.variants?.length > 0
                    ? Math.min(
                        ...product.variants.map((v) => v.importPrice || 0)
                      ).toLocaleString("vi-VN") + "₫"
                    : "Chưa có"}
                </td>

                <td className="p-3 border">
                  {product.variants?.length > 0
                    ? Math.min(
                        ...product.variants.map((v) => v.price)
                      ).toLocaleString("vi-VN") + "₫"
                    : "Chưa có giá"}
                </td>

                <td className="p-3 border">
                  {product.variants && product.variants.length > 0
                    ? product.variants.reduce(
                        (total, variant) => total + variant.stock,
                        0
                      )
                    : 0}
                </td>

                <td className="p-3 border">{product.sold ?? 0}</td>
                <td className="p-3 border">
                  {product.variants.reduce(
                    (total, variant) => total + (variant.stock ?? 0),
                    0
                  ) > 0
                    ? "Còn hàng"
                    : "Hết hàng"}
                </td>

                <td className="p-3 border">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleString("vi-VN")
                    : "Chưa có"}
                </td>
                <td className="p-3 border">
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleString("vi-VN")
                    : "Chưa có"}
                </td>

                <td className="p-3 border">
                  <div className="flex justify-center gap-2">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="Sửa"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
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
        message="Bạn có chắc chắn muốn xoá sản phẩm này không?"
      />
    </div>
  );
};

export default AdminProduct;
