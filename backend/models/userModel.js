const pool = require("../db");
const bcrypt = require("bcrypt");

// CREATE USER
const createUser = async (name, email, password, role) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

// GET USERS
const getUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

// GET USER BY EMAIL
const getUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  getUsers,
  getUserByEmail
};