import api from "../api/api";

// Lấy tất cả sản phẩm
export const getAllProducts = async (params) => {
  try {
    const res = await api.get("/products", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Xóa sản phẩm theo ID
export const deleteProductById = async (id) => {
  try {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
};

// Tạo sản phẩm mới
export const createProduct = async (formData) => {
  try {
    const { data } = await api.post("/products", formData);
    return data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Cập nhật thông tin sản phẩm
export const updateProduct = async ({ id, formData }) => {
  try {
    const { data } = await api.put(`/products/${id}`, formData);
    return data;
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

// Lấy tất cả sản phẩm
export const allProducts = async () => {
  try {
    const res = await api.get("/products");
    return res.data;
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
};
