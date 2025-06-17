import os
import json
import numpy as np
import faiss
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime
from bson import ObjectId

# Custom JSON encoder for MongoDB ObjectId
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

# Load environment variables
load_dotenv()

# Check for API key
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PhoneChatbot:
    def __init__(self, model_name: str = "text-embedding-004"):
        self.model_name = model_name
        self.index = None
        self.documents = []
        self.dimension = 768
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.max_num_result = 20
        self.safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
        ]

    def load_vector_store(self, store_id: str):
        index_path = f'vector_stores/{store_id}.index'
        if not os.path.exists(index_path):
            raise FileNotFoundError(f"Không tìm thấy file vector store: {index_path}")

        self.index = faiss.read_index(index_path)
        if self.index.d != self.dimension:
            raise ValueError(f"Kích thước vector ({self.index.d}) không khớp với kích thước mô hình ({self.dimension})")

        docs_path = f'vector_stores/{store_id}_documents.json'
        if not os.path.exists(docs_path):
            raise FileNotFoundError(f"Không tìm thấy file dữ liệu: {docs_path}")

        with open(docs_path, 'r', encoding='utf-8') as f:
            self.documents = json.load(f)

        logger.info(f"Đã tải thành công {len(self.documents)} sản phẩm điện thoại")

    def get_embedding(self, text: str) -> Optional[np.ndarray]:
        try:
            result = genai.embed_content(
                model=f"models/{self.model_name}",
                content=text,
                task_type="retrieval_document"
            )
            return np.array(result['embedding'])
        except Exception as e:
            logger.error(f"Lỗi khi tạo vector nhúng: {str(e)}")
            return None

    def search(self, query: str, top_k: int = None) -> List[Dict[str, Any]]:
        if not self.documents:
            logger.warning("Chưa có dữ liệu điện thoại được tải")
            return []

        try:
            if top_k is None:
                top_k = self.max_num_result

            color_query = self._extract_color(query)
            if color_query:
                logger.info(f"Tìm kiếm điện thoại màu: {color_query}")
                results = []
                for doc in self.documents:
                    metadata = doc['metadata']
                    for variant in metadata.get('variants', []):
                        if isinstance(variant, dict) and 'color' in variant and color_query.lower() in variant['color'].lower():
                            results.append({'document': doc, 'score': 1.0})
                            break
                return results[:top_k]

            query_embedding = self.get_embedding(query)
            if query_embedding is None:
                logger.warning("Không thể tạo vector nhúng cho câu truy vấn")
                return []

            distances, indices = self.index.search(np.array([query_embedding]).astype('float32'), top_k)

            results = []
            for i, idx in enumerate(indices[0]):
                if idx < len(self.documents):
                    doc = self.documents[idx]
                    score = float(1 / (1 + distances[0][i]))
                    results.append({'document': doc, 'score': score})

            return results

        except Exception as e:
            logger.error(f"Lỗi khi tìm kiếm: {str(e)}")
            return []

    def _extract_color(self, query: str) -> Optional[str]:
        try:
            query = query.lower()
            color_mappings = {
                'đen': 'Đen', 'trắng': 'Trắng', 'xanh': 'Xanh', 'xanh dương': 'Xanh dương',
                'xanh lá': 'Xanh lá', 'đỏ': 'Đỏ', 'hồng': 'Hồng', 'tím': 'Tím',
                'vàng': 'Vàng', 'bạc': 'Bạc', 'xám': 'Xám', 'nâu': 'Nâu', 'cam': 'Cam'
            }
            for color_key, color_value in color_mappings.items():
                if color_key in query:
                    return color_value
            return None
        except Exception as e:
            logger.error(f"Lỗi khi trích xuất màu sắc: {str(e)}")
            return None

    def generate_response(self, query: str, context: List[Dict[str, Any]]) -> str:
        try:
            if not context:
                return "Xin lỗi, tôi không tìm thấy thông tin điện thoại phù hợp với yêu cầu của bạn."

            context_text = f"Đây là thông tin của {len(context)} điện thoại liên quan:\n\n"
            for i, result in enumerate(context, 1):
                doc = result['document']
                metadata = doc['metadata']
                context_text += f"{i}. {metadata['name']}\n"
                context_text += f"   Thương hiệu: {metadata['brand']}\n"
                context_text += f"   Danh mục: {metadata['category']}\n"
                if 'variants' in metadata and metadata['variants']:
                    context_text += "   Các phiên bản:\n"
                    for variant in metadata['variants']:
                        variant_info = []
                        if 'color' in variant:
                            variant_info.append(f"Màu: {variant['color']}")
                        if 'storage' in variant:
                            variant_info.append(f"Bộ nhớ: {variant['storage']}")
                        if 'price' in variant:
                            variant_info.append(f"Giá: {variant['price']:,} VND")
                        if 'stock' in variant:
                            variant_info.append(f"Tồn kho: {variant['stock']}")
                        if variant_info:
                            context_text += f"      - {' - '.join(variant_info)}\n"
                if 'specifications' in metadata and metadata['specifications']:
                    context_text += "   Thông số kỹ thuật:\n"
                    for key, value in metadata['specifications'].items():
                        context_text += f"      - {key}: {value}\n"
                context_text += f"   Mô tả: {metadata['description']}\n\n"

            prompt = f"""Bạn là một trợ lý mua sắm điện thoại thông minh. Hãy trả lời câu hỏi của người dùng dựa trên thông tin điện thoại được cung cấp.
Nếu thông tin không có trong dữ liệu, hãy trả lời lịch sự rằng không tìm thấy thông tin.
Hãy giữ câu trả lời ngắn gọn và tập trung vào thông tin quan trọng nhất.
Nếu có nhiều kết quả, hãy tổ chức thông tin một cách rõ ràng và dễ đọc.
Trả lời bằng tiếng Việt.

Thông tin điện thoại:
{context_text}

Câu hỏi của người dùng: {query}

Hãy trả lời một cách hữu ích và ngắn gọn:"""

            response = self.model.generate_content(
                prompt,
                safety_settings=self.safety_settings,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 1024,
                }
            )

            if not response.text:
                return "Xin lỗi, tôi không thể tạo câu trả lời. Vui lòng thử lại với cách diễn đạt khác."

            return response.text.strip()

        except Exception as e:
            logger.error(f"Lỗi khi tạo câu trả lời: {str(e)}")
            return "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn."

    def chat(self, query: str) -> str:
        try:
            if not query.strip():
                return "Vui lòng nhập câu hỏi về điện thoại."

            search_results = self.search(query)
            response = self.generate_response(query, search_results)
            return response

        except Exception as e:
            logger.error(f"Lỗi trong quá trình chat: {str(e)}")
            return "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn."
