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

module.exports = {
  createProduct,
  getProducts,
};