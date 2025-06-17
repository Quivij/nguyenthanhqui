const productService = require("../services/productService");

exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body, req.files || []);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, brand, minPrice, maxPrice, search } = req.query;
    const result = await productService.getProducts(
      { category, brand, minPrice, maxPrice, search },
      { page, limit }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.files || []);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addRating = async (req, res) => {
  try {
    const product = await productService.addRating(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.searchProduct = async (req, res) => {
  try {
    const { query } = req.query;
    const result = await productService.searchProducts(query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
