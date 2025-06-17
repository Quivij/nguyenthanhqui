import os
import json
import numpy as np
import faiss
from dotenv import load_dotenv
import google.generativeai as genai
import logging
from typing import List, Dict, Any
from pymongo import MongoClient
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
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

connection_string = os.getenv('MONGO_DB_URI')
if not connection_string:
    raise ValueError("Missing MONGO_DB_URI in environment variables.")

# Configure Gemini API
genai.configure(api_key=api_key)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorStoreBuilder:
    def __init__(self, model_name: str = "text-embedding-004"):
        """
        Initialize the VectorStoreBuilder with Gemini embedding model.
        """
        self.model_name = model_name
        self.dimension = 768  # Dimension for text-embedding-004
        self.index = None
        self.documents = []
        
    def load_phone_data_from_mongodb(self, connection_string: str, database: str, collection: str) -> List[Dict[str, Any]]:
        """
        Load phone data from MongoDB and prepare it for vector store.
        """
        try:
            # Connect to MongoDB
            client = MongoClient(connection_string)
            db = client[database]
            collection = db[collection]
            
            # Fetch all documents
            cursor = collection.find({})
            documents = []
            
            for doc in cursor:
                # Convert ObjectId to string for JSON serialization
                doc['_id'] = str(doc['_id'])
                
                # Extract variants information
                variants_text = ""
                if 'variants' in doc and isinstance(doc['variants'], list):
                    for variant in doc['variants']:
                        if isinstance(variant, dict):
                            variant_info = []
                            if 'color' in variant:
                                variant_info.append(f"Color: {variant['color']}")
                            if 'storage' in variant:
                                variant_info.append(f"Storage: {variant['storage']}")
                            if 'price' in variant:
                                variant_info.append(f"Price: {variant['price']:,} VND")
                            if 'stock' in variant:
                                variant_info.append(f"Stock: {variant['stock']}")
                            if 'sold' in variant:
                                variant_info.append(f"Sold: {variant['sold']}")
                            if variant_info:
                                variants_text += f" Variant: {' - '.join(variant_info)}"

                # Extract specifications
                specs_text = ""
                if 'specifications' in doc and isinstance(doc['specifications'], dict):
                    for key, value in doc['specifications'].items():
                        specs_text += f" {key}: {value} -"

                # Create text representation for embedding
                text = f"{doc.get('name', '')} - {doc.get('description', '')} - Brand: {doc.get('brand', '')} - Category: {doc.get('category', '')} {variants_text} {specs_text}"
                
                # Create document for vector store
                vector_doc = {
                    'text': text,
                    'metadata': {
                        'id': doc.get('_id'),
                        'name': doc.get('name', ''),
                        'slug': doc.get('slug', ''),
                        'description': doc.get('description', ''),
                        'category': doc.get('category', ''),
                        'brand': doc.get('brand', ''),
                        'variants': doc.get('variants', []),
                        'specifications': doc.get('specifications', {}),
                        'sold': doc.get('sold', 0),
                        'ratings': doc.get('ratings', []),
                        'created_at': doc.get('createdAt', datetime.now().isoformat()),
                        'updated_at': doc.get('updatedAt', datetime.now().isoformat())
                    }
                }
                documents.append(vector_doc)
            
            client.close()
            logger.info(f"Successfully loaded {len(documents)} phone documents from MongoDB")
            return documents
            
        except Exception as e:
            logger.error(f"Error loading phone data from MongoDB: {str(e)}")
            raise

    def build_vector_store(self, documents: List[Dict[str, Any]]) -> str:
        """
        Build vector store from documents.
        """
        try:
            texts = [doc.get('text', '') for doc in documents]
            
            # Generate embeddings using Gemini
            embeddings = []
            for text in texts:
                result = genai.embed_content(
                    model=f"models/{self.model_name}",
                    content=text,
                    task_type="retrieval_document"
                )
                embeddings.append(result['embedding'])
            
            # Initialize FAISS index
            self.index = faiss.IndexFlatL2(self.dimension)
            self.index.add(np.array(embeddings).astype('float32'))
            
            # Store documents
            self.documents = documents
            
            # Generate a unique ID for this vector store with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            store_id = f"phone_vector_store_{len(documents)}_{timestamp}"
            
            # Save the index and documents
            self._save_vector_store(store_id)
            
            # Save vector store metadata to MongoDB
            self._save_vector_store_metadata(store_id, len(documents))
            
            logger.info(f"Successfully built vector store with ID: {store_id}")
            return store_id
            
        except Exception as e:
            logger.error(f"Error building vector store: {str(e)}")
            raise

    def _save_vector_store(self, store_id: str):
        """
        Save the vector store to disk.
        """
        try:
            os.makedirs('vector_stores', exist_ok=True)
            faiss.write_index(self.index, f'vector_stores/{store_id}.index')
            with open(f'vector_stores/{store_id}_documents.json', 'w', encoding='utf-8') as f:
                json.dump(self.documents, f, ensure_ascii=False, indent=2, cls=MongoJSONEncoder)
            logger.info(f"Successfully saved vector store with ID: {store_id}")
        except Exception as e:
            logger.error(f"Error saving vector store: {str(e)}")
            raise

    def _save_vector_store_metadata(self, store_id: str, num_documents: int):
        """
        Save vector store metadata to MongoDB.
        """
        try:
            # Connect to MongoDB
            client = MongoClient(os.getenv('MONGO_DB_URI'))
            db = client[os.getenv('MONGODB_DATABASE', 'test')]
            
            metadata = {
                'store_id': store_id,
                'num_documents': num_documents,
                'created_at': datetime.now(),
                'model_name': self.model_name,
                'dimension': self.dimension
            }
            db.vector_stores.insert_one(metadata)
            client.close()
            logger.info(f"Successfully saved vector store metadata to MongoDB: {store_id}")
        except Exception as e:
            logger.error(f"Error saving vector store metadata to MongoDB: {str(e)}")
            raise

def main():
    # MongoDB connection details
    connection_string = os.getenv('MONGO_DB_URI')
    database = os.getenv('MONGO_DB_DATABASE', 'test')
    collection = os.getenv('MONGO_DB_COLLECTION', 'products')
    
    try:
        builder = VectorStoreBuilder()
        documents = builder.load_phone_data_from_mongodb(connection_string, database, collection)
        if documents:
            store_id = builder.build_vector_store(documents)
            print(f"Created phone vector store with ID: {store_id}")
        else:
            print("No documents found in MongoDB collection")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 