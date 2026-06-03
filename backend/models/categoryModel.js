const pool = require("../db");

const getCategories = async () => {
  const result = await pool.query("SELECT id, name FROM categories ORDER BY name");
  return result.rows;
};

const createCategory = async (name) => {
  const result = await pool.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [name.trim()]
  );
  return result.rows[0];
};

const deleteCategory = async (id) => {
  const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

module.exports = { getCategories, createCategory, deleteCategory };
