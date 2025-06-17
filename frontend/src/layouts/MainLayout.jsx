import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";

const MainLayout = () => {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <main className="flex-1 container mx-auto p-4 mt-16">
        <Breadcrumb />
        <Outlet /> {/* Hiển thị nội dung trang con */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
