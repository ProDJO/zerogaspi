const ratingModel = require("../models/ratingModel");
const pool        = require("../db");

// POST /ratings
const submitRating = async (req, res) => {
  try {
    const { product_id, stars, comment, delivery_id } = req.body;

    if (!product_id || !stars) return res.status(400).send("product_id et stars sont requis");
    if (stars < 1 || stars > 5) return res.status(400).send("stars doit être entre 1 et 5");

    // Vérifier que le produit existe
    const { rows } = await pool.query("SELECT id FROM products WHERE id = $1", [product_id]);
    if (!rows[0]) return res.status(404).send("Produit introuvable");

    // Vérifier qu'il n'y a pas déjà une notation pour ce produit
    const { rows: existing } = await pool.query(
      "SELECT id FROM ratings WHERE user_id = $1 AND product_id = $2",
      [req.user.id, product_id]
    );
    if (existing[0]) return res.status(409).send("Vous avez déjà noté ce produit");

    const rating = await ratingModel.createRating(
      req.user.id, product_id, delivery_id || null, stars, comment
    );
    res.status(201).json(rating);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET /ratings/mine
const getMyRatings = async (req, res) => {
  try {
    const ratings = await ratingModel.getMyRatings(req.user.id);
    res.json(ratings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET /ratings/product/:id
const getProductRatings = async (req, res) => {
  try {
    const ratings = await ratingModel.getRatingsByProduct(req.params.id);
    res.json(ratings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = { submitRating, getMyRatings, getProductRatings };
