import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProductListPage = () => {
  const { brand } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsByBrand = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3001/api/products?brand=${brand}`,
          {
            headers: { "Cache-Control": "no-cache" },
          }
        );
        const list = res.data?.products || [];
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByBrand();
  }, [brand]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Sản phẩm {brand}</h1>

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <p>Không tìm thấy sản phẩm nào thuộc thương hiệu này.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.flatMap((product) =>
            product.variants.map((variant) => {
              const imageUrl = variant.images?.[0]
                ? variant.images[0].startsWith("http")
                  ? variant.images[0]
                  : `http://localhost:3001${variant.images[0]}`
                : "/default-image.jpg";

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
                    {`${product.name} Chính hãng VN/A ${variant.storage}`}
                  </h3>
                  <p className="text-red-500 font-bold text-base mt-1">
                    {typeof variant.price === "number"
                      ? variant.price.toLocaleString("vi-VN") + " ₫"
                      : "Giá chưa cập nhật"}
                  </p>
                  <p
                    className={`text-sm font-semibold mt-2 ${
                      variant.stock > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {variant.stock > 0 ? "Còn hàng" : "Hết hàng"}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
