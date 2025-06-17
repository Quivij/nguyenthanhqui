import { useState, useEffect } from "react";

const ProductForm = ({ initialValues = {}, onSubmit, isEdit }) => {
  const [form, setForm] = useState({
    name: initialValues.name || "",
    description: initialValues.description || "",
    category: initialValues.category || "",
    brand: initialValues.brand || "",
    specifications: initialValues.specifications || {
      screen: "",
      cpu: "",
      ram: "",
      battery: "",
      camera: "",
      os: "",
    },
    variants: initialValues.variants || [
      {
        color: "",
        storage: "",
        price: "",
        importPrice: "",
        stock: "",
        images: [],
      },
    ],
  });

  useEffect(() => {
    if (isEdit) {
      setForm({
        ...initialValues,
        variants:
          initialValues.variants?.map((v) => ({
            ...v,
            images: v.images || [],
            importPrice: v.importPrice || "",
          })) || [],
      });
    }
  }, [isEdit, initialValues]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSpecsChange = (e) => {
    setForm({
      ...form,
      specifications: {
        ...form.specifications,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...form.variants];
    updated[index][field] = value;
    setForm({ ...form, variants: updated });
  };

  const handleVariantImagesChange = (index, files) => {
    const updated = [...form.variants];
    updated[index].images = Array.from(files);
    setForm({ ...form, variants: updated });
  };

  const handleAddVariant = () => {
    setForm({
      ...form,
      variants: [
        ...form.variants,
        {
          color: "",
          storage: "",
          price: "",
          importPrice: "",
          stock: "",
          images: [],
        },
      ],
    });
  };

  const handleRemoveVariant = (index) => {
    const updated = [...form.variants];
    updated.splice(index, 1);
    setForm({ ...form, variants: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    const requiredFields = ["name", "description", "brand", "category"];
    for (let key of requiredFields) {
      if (!form[key]) {
        alert(`Trường ${key} là bắt buộc!`);
        return;
      }
      formData.append(key, form[key]);
    }

    formData.append("specifications", JSON.stringify(form.specifications));

    const variantsToSend = form.variants.map((v) => ({
      color: v.color,
      storage: v.storage,
      price: v.price,
      importPrice: v.importPrice,
      stock: v.stock,
      images: v.images.map((img) => (typeof img === "string" ? img : img.name)),
    }));
    formData.append("variants", JSON.stringify(variantsToSend));

    form.variants.forEach((variant) => {
      if (Array.isArray(variant.images)) {
        variant.images.forEach((file) => {
          if (typeof file !== "string") {
            // Chỉ append nếu là File
            formData.append("files", file);
          }
        });
      }
    });

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {["name", "description", "brand", "category"].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={`Nhập ${field}`}
          value={form[field]}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      ))}

      <div className="grid grid-cols-2 gap-2">
        {["screen", "cpu", "ram", "battery", "camera", "os"].map((spec) => (
          <input
            key={spec}
            name={spec}
            placeholder={`Thông số: ${spec}`}
            value={form.specifications[spec] || ""}
            onChange={handleSpecsChange}
            className="border p-2 rounded"
          />
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Biến thể sản phẩm</h3>
        {form.variants.map((variant, index) => (
          <div
            key={index}
            className="border p-4 rounded-md bg-gray-50 relative space-y-2"
          >
            {["color", "storage", "price", "importPrice", "stock"].map(
              (field) => (
                <input
                  key={field}
                  placeholder={
                    field === "importPrice"
                      ? "Giá nhập kho"
                      : field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  value={variant[field] || ""}
                  onChange={(e) =>
                    handleVariantChange(index, field, e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required={["color", "storage", "price", "stock"].includes(
                    field
                  )}
                />
              )
            )}
            <input
              type="file"
              multiple
              onChange={(e) => handleVariantImagesChange(index, e.target.files)}
              className="w-full"
            />
            <button
              type="button"
              onClick={() => handleRemoveVariant(index)}
              className="absolute top-2 right-2 text-red-500 text-sm"
            >
              Xoá
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddVariant}
          className="text-blue-600 font-semibold"
        >
          + Thêm biến thể
        </button>
      </div>

      <button type="submit" className="btn btn-primary mt-4">
        {isEdit ? "Cập nhật" : "Tạo"} sản phẩm
      </button>
    </form>
  );
};

export default ProductForm;
