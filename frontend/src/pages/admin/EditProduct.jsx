import { getProductById, updateProduct } from "../../api/product";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import ProductForm from "./ProductForm";
import { useMutationHook } from "../../hooks/useMutationHook";
import { toast } from "react-toastify";

const EditProduct = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  const mutation = useMutationHook(
    (formData) => updateProduct({ id, formData }),
    {
      onSuccess: () => toast.success("Cập nhật thành công"),
      onError: () => toast.error("Lỗi cập nhật"),
    }
  );

  if (isLoading) return <p>Đang tải...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Chỉnh sửa sản phẩm</h1>
      <ProductForm onSubmit={mutation.mutate} initialValues={data} isEdit />
    </div>
  );
};

export default EditProduct;
