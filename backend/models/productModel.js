const pool = require("../db");

// CREATE PRODUCT
const createProduct = async (name, description, price, quantity) => {
  const result = await pool.query(
    "INSERT INTO products (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, description, price, quantity]
  );
  return result.rows[0];
};

// GET ALL PRODUCTS
const getProducts = async () => {
  const result = await pool.query("SELECT * FROM products");
  return result.rows;
};

// ✅ GET PRODUCT BY ID
const getProductById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

// ✅ UPDATE QUANTITY
const updateProductQuantity = async (id, quantity) => {
  const result = await pool.query(
    "UPDATE products SET quantity = $1 WHERE id = $2 RETURNING *",
    [quantity, id]
  );
  return result.rows[0];
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProductQuantity,
};