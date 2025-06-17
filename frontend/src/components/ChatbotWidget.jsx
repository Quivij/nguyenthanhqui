import { useState, useRef, useEffect } from "react";
import axios from "axios";

function ChatbotWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMsg = { role: "user", text: trimmedInput, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/api/chat", {
        message: trimmedInput,
      });

      const botReply = {
        role: "assistant",
        text: res?.data?.response || "Không có phản hồi từ máy chủ.",
        timestamp: Date.now(),
        product: res?.data?.product || null, // <-- Thêm thông tin sản phẩm nếu có
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen ? (
        <button
          className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300"
          onClick={() => setIsOpen(true)}
          aria-label="Mở chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 36 36"
            fill="currentColor"
            className="w-8 h-8"
          >
            <path d="M18 2C9.163 2 2 8.79 2 17c0 4.408 1.908 8.388 5 11.234V34l4.584-2.52c1.909.537 3.927.82 6.015.82 8.837 0 16-6.79 16-15S26.837 2 18 2zm2.655 19.292l-3.514-3.808-7.396 3.808 7.731-8.292 3.36 3.808 7.283-3.808-7.464 8.292z" />
          </svg>
        </button>
      ) : (
        <div className="w-80 sm:w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-4 flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-bold text-lg">Trợ lý ảo</h3>
              <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-2xl font-bold text-blue-200 hover:text-white transition"
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-4 overflow-y-auto bg-gray-100 scrollbar-thin scrollbar-thumb-gray-300">
            <div className="flex flex-col space-y-3">
              {messages.length === 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-100">
                  <p className="mb-2 font-semibold text-gray-800">
                    Xin chào! Tôi có thể giúp gì cho bạn?
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Tìm điện thoại theo thông số</li>
                    <li>So sánh giá các mẫu điện thoại</li>
                    <li>Gợi ý điện thoại theo nhu cầu</li>
                  </ul>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-${
                    msg.role === "user" ? "end" : "start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-md mb-1 ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-900 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.product && msg.role === "assistant" && (
                    <a
                      href={`/products/${msg.product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white shadow-md rounded-xl overflow-hidden mt-1 mb-2 border hover:shadow-lg transition"
                    >
                      <img
                        src={msg.product.image}
                        alt={msg.product.name}
                        className="w-full h-40 object-cover"
                      />
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {msg.product.name}
                        </p>
                      </div>
                    </a>
                  )}
                  <span className="text-xs text-gray-400 mb-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-none inline-block text-sm text-gray-600 shadow-md">
                    <div className="flex space-x-1 animate-pulse">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="p-3 border-t bg-white flex gap-2 items-center"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="flex-1 resize-none rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                !input.trim() || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatbotWidget;
