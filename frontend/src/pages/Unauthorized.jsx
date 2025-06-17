const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          403 - Không có quyền truy cập
        </h1>
        <p className="text-gray-700">
          Bạn không có quyền truy cập vào trang này.
        </p>
        <a
          href="/"
          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
};

export default Unauthorized;
