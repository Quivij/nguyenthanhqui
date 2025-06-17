import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const bannerImages = [
  "/images/backgrounds/ipad-moi-250305121203.webp",
  "/images/backgrounds/sale-iphone-16-pro-250320081918.webp",
  "/images/backgrounds/mo-ban-iphone-16e-250312091748.webp",
];

const BannerSlider = () => {
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="w-full"
      >
        {bannerImages.map((image, index) => (
          <SwiperSlide key={index} className="flex items-center justify-center">
            <img
              src={image}
              alt={`Banner ${index + 1}`}
              className="w-full h-auto max-h-[600px] object-contain"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
