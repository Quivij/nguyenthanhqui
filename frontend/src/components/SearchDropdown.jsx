import { useState, useEffect, useRef } from "react";
import { useSearch } from "../hooks/useSearch";
import { Link } from "react-router-dom";
import { Search } from "lucide-react"; // hoặc dùng react-icons

const SearchDropdown = () => {
  const [query, setQuery] = useState("");
  const { results, search } = useSearch();
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef();

  // debounce tìm kiếm khi gõ
  useEffect(() => {
    if (query.trim()) {
      const delayDebounce = setTimeout(() => {
        search(query); // search is used inside useEffect
        setShowDropdown(true);
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setShowDropdown(false);
    }
  }, [query, search]); // Add search to the dependency array

  // click ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    search(query);
    setShowDropdown(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={inputRef}>
      <div className="flex items-center border border-gray-300 rounded-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm sản phẩm..."
          className="flex-1 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-l-lg"
        />
        <button
          onClick={handleSearch}
          className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition"
        >
          <Search size={18} />
        </button>
      </div>

      {showDropdown && (
        <ul className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 animate-fade-in">
          {results.length > 0 ? (
            results.map((product) => (
              <li
                key={product._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <Link
                  to={`/product/${product._id}`}
                  onClick={() => {
                    setQuery(""); // Clear search query
                    setShowDropdown(false); // Hide dropdown
                  }}
                  className="flex items-center p-3 space-x-3"
                >
                  <img
                    src={
                      product.image?.startsWith("http")
                        ? product.image
                        : `http://localhost:3001${
                            product.image || "/default.jpg"
                          }`
                    }
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover border border-gray-200 bg-gray-100"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      {product.name}
                    </span>
                    <span className="text-red-500 text-sm">
                      {product.price?.toLocaleString()}₫
                    </span>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="p-3 text-gray-500">
              Không tìm thấy kết quả phù hợp
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchDropdown;
