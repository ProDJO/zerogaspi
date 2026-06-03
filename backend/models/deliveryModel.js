const pool = require("../db");

// REQUEST DELIVERY — le client demande une livraison pour sa réservation
// Statut initial : 'awaiting_vendeur' (en attente d'approbation du vendeur)
const requestDelivery = async (reservation_id, client_lat, client_lng) => {
  const result = await pool.query(
    "INSERT INTO deliveries (reservation_id, status, client_lat, client_lng) VALUES ($1, 'awaiting_vendeur', $2, $3) RETURNING *",
    [reservation_id, client_lat || null, client_lng || null]
  );
  return result.rows[0];
};

// Vérifier si une livraison existe déjà pour une réservation
const getDeliveryByReservation = async (reservation_id) => {
  const result = await pool.query(
    "SELECT * FROM deliveries WHERE reservation_id = $1",
    [reservation_id]
  );
  return result.rows[0];
};

// GET DELIVERIES FOR CLIENT — livraisons liées aux réservations du client connecté
const getDeliveriesForClient = async (user_id) => {
  const result = await pool.query(
    `SELECT d.*,
            r.quantity,
            p.id    AS product_id,
            p.name  AS product_name,
            p.price AS product_price,
            p.image AS product_image
     FROM deliveries d
     JOIN reservations r ON d.reservation_id = r.id
     JOIN products     p ON r.product_id     = p.id
     WHERE r.user_id = $1
     ORDER BY d.created_at DESC`,
    [user_id]
  );
  return result.rows;
};

// GET DELIVERIES FOR VENDEUR — demandes en attente pour les produits du vendeur
const getDeliveriesForVendeur = async (vendeur_id) => {
  const result = await pool.query(
    `SELECT d.*, r.quantity, p.name AS product_name, u.name AS client_name
     FROM deliveries d
     JOIN reservations r ON d.reservation_id = r.id
     JOIN products p ON r.product_id = p.id
     JOIN users u ON r.user_id = u.id
     WHERE p.seller_id = $1 AND d.status = 'awaiting_vendeur'
     ORDER BY d.created_at DESC`,
    [vendeur_id]
  );
  return result.rows;
};

// VENDEUR APPROVE — le vendeur accepte, la livraison devient disponible pour les livreurs
const vendeurApproveDelivery = async (id) => {
  const result = await pool.query(
    `UPDATE deliveries SET status = 'pending', updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

// VENDEUR REJECT — le vendeur refuse la demande de livraison
const vendeurRejectDelivery = async (id) => {
  const result = await pool.query(
    `UPDATE deliveries SET status = 'rejected', updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

// CREATE DELIVERY (admin) — crée directement en statut pending (bypass vendeur)
const createDelivery = async (reservation_id) => {
  const result = await pool.query(
    "INSERT INTO deliveries (reservation_id, status) VALUES ($1, 'pending') RETURNING *",
    [reservation_id]
  );
  return result.rows[0];
};

// GET AVAILABLE DELIVERIES — livreur voit les livraisons approuvées par le vendeur
const getAvailableDeliveries = async () => {
  const result = await pool.query(
    `SELECT d.id, d.status, d.created_at, d.client_lat, d.client_lng,
            r.quantity, p.name AS product_name, u.name AS client_name
     FROM deliveries d
     JOIN reservations r ON d.reservation_id = r.id
     JOIN products p ON r.product_id = p.id
     JOIN users u ON r.user_id = u.id
     WHERE d.livreur_id IS NULL AND d.status = 'pending'
     ORDER BY d.created_at ASC`
  );
  return result.rows;
};

// GET DELIVERIES BY LIVREUR — livraisons assignées au livreur connecté
const getDeliveriesByLivreur = async (livreur_id) => {
  const result = await pool.query(
    `SELECT d.id, d.status, d.updated_at, d.client_lat, d.client_lng,
            r.quantity, p.name AS product_name, u.name AS client_name
     FROM deliveries d
     JOIN reservations r ON d.reservation_id = r.id
     JOIN products p ON r.product_id = p.id
     JOIN users u ON r.user_id = u.id
     WHERE d.livreur_id = $1
     ORDER BY d.updated_at DESC`,
    [livreur_id]
  );
  return result.rows;
};

// GET DELIVERY BY ID
const getDeliveryById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM deliveries WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

// ACCEPT DELIVERY — le livreur s'assigne la livraison
const acceptDelivery = async (id, livreur_id) => {
  const result = await pool.query(
    `UPDATE deliveries
     SET livreur_id = $1, status = 'accepted', updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [livreur_id, id]
  );
  return result.rows[0];
};

// UPDATE DELIVERY STATUS
const updateDeliveryStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE deliveries SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

// UPDATE DELIVERY POSITION (GPS)
const updateDeliveryPosition = async (id, lat, lng) => {
  const result = await pool.query(
    `UPDATE deliveries
     SET current_lat = $1, current_lng = $2, position_updated_at = NOW()
     WHERE id = $3
     RETURNING id, current_lat, current_lng, position_updated_at`,
    [lat, lng, id]
  );
  return result.rows[0];
};

// GET ALL DELIVERIES (admin) — vue complète client + vendeur + livreur
const getAllDeliveries = async () => {
  const result = await pool.query(
    `SELECT
       d.id,
       d.status,
       d.created_at,
       d.updated_at,
       r.quantity,
       r.id        AS reservation_id,
       p.name      AS product_name,
       p.price,
       uc.name     AS client_name,
       uv.name     AS vendeur_name,
       ul.name     AS livreur_name
     FROM deliveries d
     JOIN reservations r ON d.reservation_id = r.id
     JOIN products     p ON r.product_id     = p.id
     JOIN users       uc ON r.user_id        = uc.id
     JOIN users       uv ON p.seller_id      = uv.id
     LEFT JOIN users  ul ON d.livreur_id     = ul.id
     ORDER BY d.created_at DESC`
  );
  return result.rows;
};

module.exports = {
  requestDelivery,
  getDeliveryByReservation,
  getDeliveriesForClient,
  getDeliveriesForVendeur,
  vendeurApproveDelivery,
  vendeurRejectDelivery,
  createDelivery,
  getAvailableDeliveries,
  getDeliveriesByLivreur,
  getDeliveryById,
  acceptDelivery,
  updateDeliveryStatus,
  updateDeliveryPosition,
  getAllDeliveries,
};
