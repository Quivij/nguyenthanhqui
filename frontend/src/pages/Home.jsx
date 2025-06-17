import React from "react";
import ProductSlider from "../components/ProductSlider";
import BannerSlider from "../components/BannerSlider";
import ProductTabs from "../components/ProductTabs";

const Home = () => {
  return (
    <div>
      <BannerSlider />
      <h1 className="text-2xl font-bold text-center mt-5">
        Danh sách sản phẩm nổi bật
      </h1>
      <ProductSlider />
      <ProductTabs />
    </div>
  );
};

export default Home;
