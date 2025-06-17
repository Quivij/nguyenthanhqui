import { FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-screen bg-gray-100 border-t-2 border-black py-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Tải ứng dụng */}

        {/* Nhập email */}
        <p className="text-lg font-bold">
          Nhận thông tin của điện thoại giá rẻ
        </p>
        <div className="relative w-96 mt-4">
          <input
            type="text"
            placeholder="Nhập email của bạn"
            className="w-full border-b-2 border-black text-center py-2 focus:outline-none bg-transparent"
          />
          <span className="absolute right-4 bottom-3 cursor-pointer text-gray-600 hover:text-black text-xl">
            →
          </span>
        </div>

        {/* Liên kết */}
        <ul className="flex flex-wrap justify-center gap-6 my-6 text-gray-700 font-bold text-sm">
          <li>
            <a href="#">
              <img
                src="/images/img-congthuong.png"
                alt="Bộ Công Thương"
                className="w-24"
              />
            </a>
          </li>
          <li>
            <a href="#">Liên Hệ</a>
          </li>
          <li>
            <a href="#">Tuyển Dụng</a>
          </li>
          <li>
            <a href="#">Giới Thiệu</a>
          </li>
        </ul>

        {/* Mạng xã hội */}
        <div className="flex gap-6 text-gray-700 text-2xl my-4">
          <a
            href="https://www.facebook.com/anhnguyet.lethi.3745"
            className="hover:text-blue-600"
          >
            <FaFacebookF />
          </a>
          <a href="#" className="hover:text-blue-400">
            <FaTwitter />
          </a>
          <a href="#" className="hover:text-red-600">
            <FaYoutube />
          </a>
        </div>

        {/* Thông tin công ty */}
        <div className="text-center text-sm text-gray-600 max-w-2xl">
          <p>
            Địa chỉ: 97 man thiện,phường hiệp phú,TP thủ đức, TP. Hồ Chí Minh,
            Việt Nam.
          </p>
          <p>Điện thoại: 0832028447</p>
        </div>

        {/* Bản quyền */}
        <div className="w-screen bg-gray-300 text-center py-3 mt-6 text-sm">
          © HQshop All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
