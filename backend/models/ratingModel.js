const pool = require("../db");

const createRating = async (user_id, product_id, delivery_id, stars, comment) => {
  const result = await pool.query(
    `INSERT INTO ratings (user_id, product_id, delivery_id, stars, comment)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, product_id, delivery_id, stars, comment || null]
  );
  return result.rows[0];
};

const getRatingByDelivery = async (user_id, delivery_id) => {
  const result = await pool.query(
    "SELECT * FROM ratings WHERE user_id = $1 AND delivery_id = $2",
    [user_id, delivery_id]
  );
  return result.rows[0];
};

// Client's own ratings — keyed by product_id for quick lookup
const getMyRatings = async (user_id) => {
  const result = await pool.query(
    "SELECT * FROM ratings WHERE user_id = $1",
    [user_id]
  );
  return result.rows;
};

// Check if user already rated a product
const getRatingByProduct = async (user_id, product_id) => {
  const result = await pool.query(
    "SELECT * FROM ratings WHERE user_id = $1 AND product_id = $2",
    [user_id, product_id]
  );
  return result.rows[0];
};

const getRatingsByProduct = async (product_id) => {
  const result = await pool.query(
    `SELECT r.stars, r.comment, r.created_at, u.name AS author
     FROM ratings r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [product_id]
  );
  return result.rows;
};

module.exports = { createRating, getRatingByDelivery, getRatingByProduct, getMyRatings, getRatingsByProduct };
