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

// GET USERS (sans le mot de passe)
const getUsers = async () => {
  const result = await pool.query(
    "SELECT id, name, email, role, avatar, available, pending_role, pending_role_status FROM users"
  );
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

// GET USER BY ID (sans le mot de passe)
const getUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email, role, avatar, pending_role, pending_role_status FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

// GET ME — profil complet de l'utilisateur connecté
const getMe = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email, role, avatar, default_address, available, pending_role, pending_role_status FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

// TOGGLE AVAILABILITY (livreur)
const toggleAvailability = async (id) => {
  const result = await pool.query(
    "UPDATE users SET available = NOT available WHERE id = $1 RETURNING available",
    [id]
  );
  return result.rows[0];
};

// UPDATE PASSWORD
const updatePassword = async (id, hashedPassword) => {
  await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, id]);
};

// GET PASSWORD HASH (for verification)
const getPasswordHash = async (id) => {
  const result = await pool.query("SELECT password FROM users WHERE id = $1", [id]);
  return result.rows[0]?.password;
};

// UPDATE DEFAULT ADDRESS
const updateDefaultAddress = async (id, address) => {
  const result = await pool.query(
    "UPDATE users SET default_address = $1 WHERE id = $2 RETURNING id, name, email, role, avatar, default_address, pending_role, pending_role_status",
    [address, id]
  );
  return result.rows[0];
};

// UPDATE AVATAR
const updateAvatar = async (id, filename) => {
  const result = await pool.query(
    "UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, name, email, role, avatar, pending_role, pending_role_status",
    [filename, id]
  );
  return result.rows[0];
};

// UPDATE PENDING ROLE (demande de rôle vendeur/livreur)
const updatePendingRole = async (id, pending_role, pending_role_status) => {
  const result = await pool.query(
    "UPDATE users SET pending_role = $1, pending_role_status = $2 WHERE id = $3 RETURNING id, name, email, role, avatar, pending_role, pending_role_status",
    [pending_role, pending_role_status, id]
  );
  return result.rows[0];
};

// GET PENDING ROLE REQUESTS — pour l'admin
const getPendingRoleRequests = async () => {
  const result = await pool.query(
    "SELECT id, name, email, role, avatar, pending_role, pending_role_status FROM users WHERE pending_role_status = 'pending'"
  );
  return result.rows;
};

// APPROVE ROLE — l'admin accepte la demande
const approveRole = async (id) => {
  const result = await pool.query(
    `UPDATE users
     SET role = pending_role, pending_role = NULL, pending_role_status = 'approved'
     WHERE id = $1
     RETURNING id, name, email, role, avatar, pending_role, pending_role_status`,
    [id]
  );
  return result.rows[0];
};

// REJECT ROLE — l'admin refuse la demande
const rejectRole = async (id) => {
  const result = await pool.query(
    `UPDATE users
     SET pending_role = NULL, pending_role_status = 'rejected'
     WHERE id = $1
     RETURNING id, name, email, role, avatar, pending_role, pending_role_status`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  updatePassword, getPasswordHash, updateDefaultAddress, toggleAvailability,
  createUser,
  getUsers,
  getUserByEmail,
  getUserById,
  getMe,
  updateAvatar,
  updatePendingRole,
  getPendingRoleRequests,
  approveRole,
  rejectRole,
};
