const pool = require("../db");

// CREATE PRODUCT — status dépend du rôle (passé en paramètre depuis le controller)
const LOW_STOCK_THRESHOLD = 5;

const createProduct = async (name, description, price, quantity, image, seller_id, status, category) => {
  const result = await pool.query(
    "INSERT INTO products (name, description, price, quantity, image, seller_id, status, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [name, description, price, quantity, image, seller_id, status, category || null]
  );
  return result.rows[0];
};

// GET ALL APPROVED PRODUCTS (public — catalogue) avec note moyenne
const getProducts = async () => {
  const result = await pool.query(
    `SELECT p.*,
            ROUND(AVG(r.stars), 1)::FLOAT AS avg_rating,
            COUNT(r.id)::INT              AS rating_count
     FROM products p
     LEFT JOIN ratings r ON r.product_id = p.id
     WHERE p.status = 'approved'
     GROUP BY p.id
     ORDER BY p.id DESC`
  );
  return result.rows;
};

// GET ALL PRODUCTS FOR ADMIN (toutes statuts confondus)
const getAllProductsAdmin = async () => {
  const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
  return result.rows;
};

// GET PRODUCTS BY VENDEUR — tous ses produits (pending, approved, rejected)
const getProductsByVendeur = async (seller_id) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE seller_id = $1 ORDER BY id DESC",
    [seller_id]
  );
  return result.rows;
};

// GET PENDING PRODUCTS (admin — en attente d'approbation)
const getPendingProducts = async () => {
  const result = await pool.query(
    "SELECT p.*, u.name AS seller_name FROM products p JOIN users u ON p.seller_id = u.id WHERE p.status = 'pending' ORDER BY p.id DESC"
  );
  return result.rows;
};

// GET PRODUCT BY ID
const getProductById = async (id) => {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0];
};

// UPDATE QUANTITY (utilisé par le système de réservation)
const updateProductQuantity = async (id, quantity) => {
  const result = await pool.query(
    "UPDATE products SET quantity = $1 WHERE id = $2 RETURNING *",
    [quantity, id]
  );
  return result.rows[0];
};

// UPDATE PRODUCT — mise à jour partielle (seuls les champs fournis sont modifiés)
const updateProduct = async (id, fields) => {
  const allowed = ["name", "description", "price", "quantity", "image", "category"];
  const setClauses = [];
  const values = [];
  let i = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${i++}`);
      values.push(fields[key]);
    }
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const result = await pool.query(
    `UPDATE products SET ${setClauses.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0];
};

// APPROVE PRODUCT (admin)
const approveProduct = async (id) => {
  const result = await pool.query(
    "UPDATE products SET status = 'approved' WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// REJECT PRODUCT (admin)
const rejectProduct = async (id) => {
  const result = await pool.query(
    "UPDATE products SET status = 'rejected' WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// DELETE PRODUCT
const deleteProduct = async (id) => {
  const result = await pool.query(
    "DELETE FROM products WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// VENDEUR STATS
const getVendeurStats = async (seller_id) => {
  const [summary, products] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(DISTINCT p.id)::int                                              AS total_products,
         COUNT(DISTINCT CASE WHEN p.status='approved' THEN p.id END)::int      AS approved,
         COUNT(DISTINCT CASE WHEN p.status='pending'  THEN p.id END)::int      AS pending,
         COALESCE(SUM(r.quantity),0)::int                                       AS total_reservations,
         COALESCE(SUM(r.quantity * p.price::numeric),0)::float                  AS estimated_revenue,
         COUNT(DISTINCT CASE WHEN p.quantity < ${LOW_STOCK_THRESHOLD} AND p.status='approved' THEN p.id END)::int AS low_stock_count
       FROM products p
       LEFT JOIN reservations r ON r.product_id = p.id
       WHERE p.seller_id = $1`,
      [seller_id]
    ),
    pool.query(
      `SELECT p.id, p.name, p.quantity, p.price, p.status, p.category, p.image,
              COALESCE(SUM(r.quantity),0)::int        AS reserved_qty,
              COALESCE(SUM(r.quantity * p.price::numeric),0)::float AS revenue
       FROM products p
       LEFT JOIN reservations r ON r.product_id = p.id
       WHERE p.seller_id = $1
       GROUP BY p.id
       ORDER BY reserved_qty DESC`,
      [seller_id]
    ),
  ]);
  return { summary: summary.rows[0], products: products.rows };
};

module.exports = {
  createProduct,
  getProducts,
  getAllProductsAdmin,
  getProductsByVendeur,
  getPendingProducts,
  getProductById,
  updateProductQuantity,
  updateProduct,
  approveProduct,
  rejectProduct,
  deleteProduct,
  getVendeurStats,
  LOW_STOCK_THRESHOLD,
};
