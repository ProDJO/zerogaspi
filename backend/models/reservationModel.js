const pool = require("../db");

// CREATE
const createReservation = async (user_id, product_id, quantity) => {
  const result = await pool.query(
    "INSERT INTO reservations (user_id, product_id, quantity, status) VALUES ($1, $2, $3, 'pending') RETURNING *",
    [user_id, product_id, quantity]
  );
  return result.rows[0];
};

// GET BY ID
const getReservationById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM reservations WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

// DELETE
const deleteReservation = async (id) => {
  const result = await pool.query(
    "DELETE FROM reservations WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};
// GET reservations by user
const getReservationsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT r.*, p.name, p.description
     FROM reservations r
     JOIN products p ON r.product_id = p.id
     WHERE r.user_id = $1`,
    [user_id]
  );
  return result.rows;
};

// GET ALL RESERVATIONS — pour l'admin (avec nom produit et nom client)
const getAllReservations = async () => {
  const result = await pool.query(
    `SELECT r.*, p.name AS product_name, u.name AS user_name
     FROM reservations r
     JOIN products p ON r.product_id = p.id
     JOIN users u ON r.user_id = u.id
     ORDER BY r.id DESC`
  );
  return result.rows;
};

module.exports = {
  createReservation,
  getReservationById,
  deleteReservation,
  getReservationsByUser,
  getAllReservations,
};