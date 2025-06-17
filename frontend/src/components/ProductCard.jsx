const ProductCard = ({ product }) => {
  const firstVariant = product.variants?.[0];

  // Lấy ảnh đầu tiên hoặc dùng ảnh mặc định
  const image = firstVariant?.images?.[0] || "/default.jpg";

  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <img
        src={image.startsWith("http") ? image : `http://localhost:3001${image}`}
        alt={product.name}
        className="w-full h-48 object-cover bg-gray-100"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h2>
        <p className="text-red-500 font-bold mt-1">
          {(firstVariant?.price || 0).toLocaleString()}₫
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
