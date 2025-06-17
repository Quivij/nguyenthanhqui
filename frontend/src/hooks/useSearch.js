import axios from "axios";
import { useState, useRef } from "react";

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isBlockedRef = useRef(false); // Lưu trạng thái bị chặn

  const search = async (query) => {
    if (!query || isBlockedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `http://localhost:3001/api/products/search?query=${encodeURIComponent(
          query
        )}`
      );

      if (res.status === 200) {
        setResults(res.data);
      } else {
        setError("Không thể tải kết quả tìm kiếm.");
      }
    } catch (error) {
      console.error("Search error:", error);
      if (error.response) {
        if (error.response.status === 429) {
          setError(
            "Bạn đang gửi quá nhiều yêu cầu hoặc bị chặn vì nghi ngờ tấn công. Vui lòng thử lại sau."
          );
          isBlockedRef.current = true;
          setTimeout(() => {
            isBlockedRef.current = false;
          }, 5000); // Gỡ chặn sau 5 giây
        } else {
          setError(`Lỗi từ server: ${error.response.status}`);
        }
      } else if (error.request) {
        setError("Không thể kết nối với server.");
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
};
