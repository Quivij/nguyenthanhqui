from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import PhoneChatbot
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Cho phép CORS từ frontend

# Khởi tạo chatbot
chatbot = PhoneChatbot()
store_id = 'phone_vector_store_27_20250611_234455'

# Tải dữ liệu vector store khi khởi động
try:
    logger.info("Đang tải dữ liệu điện thoại...")
    chatbot.load_vector_store(store_id)
    logger.info("Đã tải xong dữ liệu điện thoại!")
except Exception as e:
    logger.error(f"Lỗi khi tải vector store: {str(e)}")
    raise

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    API nhận câu hỏi và trả về câu trả lời từ chatbot.
    """
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Missing message in request'}), 400

        message = data['message']
        response = chatbot.chat(message)

        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Lỗi xử lý câu hỏi: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Kiểm tra tình trạng server.
    """
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
