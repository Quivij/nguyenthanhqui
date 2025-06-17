import React from "react";
// import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Danh sách sản phẩm mở rộng
const products = [
  {
    id: 1,
    name: "iPhone 16e 128GB - Chính hãng VN/A",
    price: "16,390,000đ",
    image: "/images/products/iphone/iPhone 16e 128GB - Chính hãng VN A.jpg",
    category: "iphone",
  },
  {
    id: 2,
    name: "iPhone 16 128GB - Chính hãng VN/A",
    price: "19,290,000đ",
    image: "/images/products/iphone/iPhone 16 128GB - Chính hãng VN A.jpg",
    category: "iphone",
  },
  {
    id: 3,
    name: "iPhone 16 Plus 128GB - Chính hãng VN/A",
    price: "21,990,000₫",
    image: "/images/products/iphone/iPhone 16 Plus 128GB - Chính hãng VN A.jpg",
    category: "iphone",
  },
  {
    id: 4,
    name: "iPhone 16 Pro 128GB - Chính hãng VN/A",
    price: "24,790,000₫",
    image: "/images/products/iphone/iPhone 16 Pro 128GB - Chính hãng VN A.jpg",
    category: "iphone",
  },
  {
    id: 5,
    name: "iPhone 16 Pro Max 256GB - Chính hãng VN/A",
    price: "30,790,000₫",
    image:
      "/images/products/iphone/iPhone 16 Pro Max 256GB - Chính hãng VN A.jpg",
    category: "iphone",
  },
  {
    id: 6,
    name: "iPhone 15 128GB - Chính hãng VN/A",
    price: "15,790,000₫",
    image: "/images/products/iphone/iPhone 15 128GB - Chính hãng VN A.jpg",
    category: "iphone",
  },
  {
    id: 7,
    name: "iPhone 15 Plus 128GB - Chính hãng VN/A",
    price: "18,990,000₫",
    image: "/images/products/iphone/iPhone 15 Plus 128GB - Chính hãng VN A.jpg",
    category: "iphone",
  },
  {
    id: 8,
    name: "iPhone 14 128GB - Chính hãng VN/A",
    price: "12,790,000₫",
    image: "/images/products/iphone/iPhone 14 128GB - Chính hãng VN A.jpg",
    category: "iphone",
  },
  {
    id: 9,
    name: "iPhone 14 Plus 128GB - Chính hãng VN/A",
    price: "17,790,000₫",
    image: "/images/products/iphone/iPhone 14 Plus 128GB - Chính hãng VN A.jpg",
    category: "iphone",
  },
  {
    id: 10,
    name: "iPhone 13 128GB - Chính hãng VN/A",
    price: "11,690,000₫",
    image: "/images/products/iphone/iPhone 13 128GB - Chính Hãng VN A.jpg",
    category: "iphone",
  },
];

const ProductSlider = () => {
  return (
    <div className="max-w-6xl mx-auto p-5">
      <h2 className="text-2xl font-bold mb-4 text-center"></h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1100: { slidesPerView: 4 }, // Giảm kích thước xuống 1100px thay vì 1280px
        }}
      >
        {products.map((product) => (
          <SwiperSlide
            key={product.id}
            className="bg-white shadow-lg rounded-lg p-4"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-md"
            />
            <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
            <p className="text-red-500 font-bold">{product.price}</p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductSlider;
