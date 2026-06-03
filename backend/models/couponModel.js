const pool = require("../db");

const getCoupons = async () => {
  const result = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
  return result.rows;
};

const createCoupon = async (code, discount_pct) => {
  const result = await pool.query(
    "INSERT INTO coupons (code, discount_pct) VALUES ($1, $2) RETURNING *",
    [code.trim().toUpperCase(), parseInt(discount_pct, 10)]
  );
  return result.rows[0];
};

const deleteCoupon = async (id) => {
  const result = await pool.query("DELETE FROM coupons WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

const validateCoupon = async (code) => {
  const result = await pool.query(
    "SELECT * FROM coupons WHERE code = $1 AND active = TRUE",
    [code.trim().toUpperCase()]
  );
  return result.rows[0] || null;
};

module.exports = { getCoupons, createCoupon, deleteCoupon, validateCoupon };
