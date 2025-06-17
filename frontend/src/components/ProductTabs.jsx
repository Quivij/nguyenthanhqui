import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../api/product"; // Đảm bảo đường dẫn đúng

const brands = [
  { id: "all", name: "Tất cả" },
  { id: "Apple", name: "Apple" },
  { id: "Samsung", name: "Samsung" },
  { id: "Xiaomi", name: "Xiaomi" },
  { id: "Oppo", name: "Oppo" },
  { id: "Realme", name: "Realme" },
  { id: "HONOR", name: "HONOR" },
  { id: "Itel", name: "Itel" },
  { id: "Nokia", name: "Nokia" },
  { id: "Vivo", name: "Vivo" },
];

export default function ProductTabs() {
  const [activeBrand, setActiveBrand] = useState("all");
  const navigate = useNavigate();

  const {
    data: { products = [], total = 0, pages = 0 } = {},
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", activeBrand],
    queryFn: () =>
      getAllProducts(
        activeBrand === "all"
          ? { limit: 1000 }
          : { brand: activeBrand, limit: 1000 }
      ),
    retry: 2,
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Brand Filter */}
      <div className="flex border-b border-gray-300 overflow-x-auto mb-4">
        {brands.map((brand) => (
          <button
            key={brand.id}
            className={`px-4 py-2 font-medium whitespace-nowrap text-gray-700 border-b-2 ${
              activeBrand === brand.id
                ? "border-blue-500 text-blue-500"
                : "border-transparent hover:text-blue-500"
            } transition-colors duration-200`}
            onClick={() => setActiveBrand(brand.id)}
          >
            {brand.name}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isLoading ? (
          <p className="col-span-full text-center text-gray-500">
            Đang tải sản phẩm...
          </p>
        ) : isError ? (
          <p className="col-span-full text-center text-red-500">
            Lỗi tải dữ liệu sản phẩm: {error.message}
          </p>
        ) : products.length > 0 ? (
          products.map((product) => {
            return product.variants.map((variant) => {
              const imageUrl = variant.images?.[0]
                ? variant.images[0].startsWith("http")
                  ? variant.images[0] // Nếu đường dẫn đầy đủ
                  : `http://localhost:3001${variant.images[0]}` // Đảm bảo thêm `localhost:3001`
                : "/default-image.jpg"; // Nếu không có ảnh, sử dụng ảnh mặc định

              return (
                <div
                  key={variant._id}
                  className="p-3 border rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-white cursor-pointer flex flex-col items-center text-center"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="w-32 h-32 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold mt-3 line-clamp-2 h-12">
                    {/* Hiển thị tên sản phẩm với dung lượng bộ nhớ */}
                    {`${product.name} Chính hãng VN/A ${variant.storage}`}
                  </h3>

                  {/* Hiển thị giá sản phẩm */}
                  <p className="text-red-500 font-bold text-base mt-1">
                    {typeof variant.price === "number"
                      ? variant.price.toLocaleString("vi-VN") + " ₫"
                      : "Giá chưa cập nhật"}
                  </p>
                  {/* Hiển thị trạng thái hàng tồn kho */}
                  <p
                    className={`text-sm font-semibold mt-2 ${
                      variant.stock > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {variant.stock > 0 ? "Còn hàng" : "Hết hàng"}
                  </p>
                </div>
              );
            });
          })
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            Không có sản phẩm nào thuộc thương hiệu này.
          </p>
        )}
      </div>

      {/* Pagination (thông tin thôi, không có nút chuyển trang) */}
      <div className="flex justify-center mt-6">
        <p className="text-sm text-gray-500 mt-2">
          {total} sản phẩm | {pages} trang
        </p>
      </div>
    </div>
  );
}
