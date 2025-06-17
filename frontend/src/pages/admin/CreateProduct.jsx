import { createProduct } from "../../api/product";
import { useMutationHook } from "../../hooks/useMutationHook";
import { toast } from "react-toastify";
import ProductForm from "./ProductForm";

const CreateProduct = () => {
  const mutation = useMutationHook(createProduct, {
    onSuccess: () => toast.success("Tạo sản phẩm thành công"),
    onError: () => toast.error("Tạo thất bại"),
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Tạo sản phẩm mới</h1>
      <ProductForm onSubmit={mutation.mutate} />
    </div>
  );
};

export default CreateProduct;
