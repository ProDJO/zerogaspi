const pool          = require("../db");
const categoryModel = require("../models/categoryModel");
const couponModel   = require("../models/couponModel");

// ── STATS ──────────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [users, products, deliveries, resByDay, ratings, topProducts] = await Promise.all([
      pool.query("SELECT role, COUNT(*)::int AS count FROM users GROUP BY role ORDER BY count DESC"),
      pool.query("SELECT status, COUNT(*)::int AS count FROM products GROUP BY status"),
      pool.query("SELECT status, COUNT(*)::int AS count FROM deliveries GROUP BY status"),
      pool.query(`
        SELECT TO_CHAR(created_at, 'DD/MM') AS day, COUNT(*)::int AS count
        FROM reservations
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE(created_at)
        ORDER BY DATE(created_at)
      `),
      pool.query("SELECT ROUND(AVG(stars),1)::float AS avg, COUNT(*)::int AS count FROM ratings"),
      pool.query(`
        SELECT p.name, COUNT(r.id)::int AS reservations
        FROM products p
        LEFT JOIN reservations r ON r.product_id = p.id
        WHERE p.status = 'approved'
        GROUP BY p.id, p.name
        ORDER BY reservations DESC
        LIMIT 5
      `),
    ]);
    res.json({
      users:        users.rows,
      products:     products.rows,
      deliveries:   deliveries.rows,
      reservations_by_day: resByDay.rows,
      ratings:      ratings.rows[0],
      top_products: topProducts.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// ── CATEGORIES ─────────────────────────────────────────────────────────────
const listCategories = async (req, res) => {
  try {
    res.json(await categoryModel.getCategories());
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).send("Nom requis");
  try {
    res.status(201).json(await categoryModel.createCategory(name));
  } catch (err) {
    if (err.code === "23505") return res.status(409).send("Cette catégorie existe déjà");
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deleted = await categoryModel.deleteCategory(req.params.id);
    if (!deleted) return res.status(404).send("Catégorie non trouvée");
    res.json({ message: "Catégorie supprimée" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// ── COUPONS ────────────────────────────────────────────────────────────────
const listCoupons = async (req, res) => {
  try {
    res.json(await couponModel.getCoupons());
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

const createCoupon = async (req, res) => {
  const { code, discount_pct } = req.body;
  if (!code || !code.trim()) return res.status(400).send("Code requis");
  const pct = parseInt(discount_pct, 10);
  if (isNaN(pct) || pct < 1 || pct > 100) return res.status(400).send("Remise entre 1 et 100 %");
  try {
    res.status(201).json(await couponModel.createCoupon(code, pct));
  } catch (err) {
    if (err.code === "23505") return res.status(409).send("Ce code promo existe déjà");
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const deleted = await couponModel.deleteCoupon(req.params.id);
    if (!deleted) return res.status(404).send("Coupon non trouvé");
    res.json({ message: "Coupon supprimé" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// Public: validate a coupon code (clients use this at checkout)
const validateCoupon = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).send("Code requis");
  try {
    const coupon = await couponModel.validateCoupon(code);
    if (!coupon) return res.status(404).send("Code invalide ou expiré");
    res.json({ discount_pct: coupon.discount_pct, code: coupon.code });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// ── CSV EXPORT ─────────────────────────────────────────────────────────────
const toCsv = (rows, cols) => {
  const header = cols.join(",");
  const lines  = rows.map((r) =>
    cols.map((c) => {
      const v = r[c] ?? "";
      const s = String(v).replace(/"/g, '""');
      return /[,"\n]/.test(s) ? `"${s}"` : s;
    }).join(",")
  );
  return [header, ...lines].join("\n");
};

const exportUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, available FROM users ORDER BY id"
    );
    const csv = toCsv(rows, ["id", "name", "email", "role", "available"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=utilisateurs.csv");
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

const exportOrders = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.id, u.name AS client, p.name AS produit, r.quantity,
             (r.quantity * p.price::numeric)::float AS total_eur,
             r.status, r.created_at
      FROM reservations r
      JOIN users    u ON u.id = r.user_id
      JOIN products p ON p.id = r.product_id
      ORDER BY r.id
    `);
    const csv = toCsv(rows, ["id","client","produit","quantity","total_eur","status","created_at"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=commandes.csv");
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

const exportDeliveries = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.id, p.name AS produit, c.name AS client, l.name AS livreur,
             r.quantity, d.status, d.created_at
      FROM deliveries d
      JOIN reservations r ON r.id = d.reservation_id
      JOIN products     p ON p.id = r.product_id
      JOIN users        c ON c.id = r.user_id
      LEFT JOIN users   l ON l.id = d.livreur_id
      ORDER BY d.id
    `);
    const csv = toCsv(rows, ["id","produit","client","livreur","quantity","status","created_at"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=livraisons.csv");
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  getStats,
  listCategories, createCategory, deleteCategory,
  listCoupons, createCoupon, deleteCoupon, validateCoupon,
  exportUsers, exportOrders, exportDeliveries,
};
