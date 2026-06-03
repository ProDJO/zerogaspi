const productModel  = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const LOW_STOCK = productModel.LOW_STOCK_THRESHOLD;

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Ajoute l'URL complète de l'image si elle existe
function withImageUrl(product) {
  if (product?.image) {
    product.image = `${BASE_URL}/uploads/${product.image}`;
  }
  return product;
}

// CREATE PRODUCT (admin ou vendeur)
// Admin → status 'approved' immédiatement visible
// Vendeur → status 'pending', attend validation admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;

    if (!name) return res.status(400).send("Le nom est requis");
    if (!price) return res.status(400).send("Le prix est requis");

    const image = req.file ? req.file.filename : null;
    const seller_id = req.user.id;
    const status = req.user.role === "admin" ? "approved" : "pending";
    const { category } = req.body;

    // Validate category against the categories table (if provided)
    if (category) {
      const validCategories = await categoryModel.getCategories();
      const isValid = validCategories.some((c) => c.name === category);
      if (!isValid) return res.status(400).send("Catégorie invalide");
    }

    const product = await productModel.createProduct(name, description, price, quantity, image, seller_id, status, category);
    res.status(201).json(withImageUrl(product));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET ALL APPROVED PRODUCTS (public)
const getProducts = async (req, res) => {
  try {
    const products = await productModel.getProducts();
    res.json(products.map(withImageUrl));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET ALL PRODUCTS FOR ADMIN (tous statuts)
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await productModel.getAllProductsAdmin();
    res.json(products.map(withImageUrl));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET MY PRODUCTS (vendeur — tous ses produits, tous statuts)
const getMyProducts = async (req, res) => {
  try {
    const products = await productModel.getProductsByVendeur(req.user.id);
    res.json(products.map(withImageUrl));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET PENDING PRODUCTS (admin — file d'attente d'approbation)
const getPendingProducts = async (req, res) => {
  try {
    const products = await productModel.getPendingProducts();
    res.json(products.map(withImageUrl));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET PRODUCT BY ID (public)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);

    if (!product) return res.status(404).send("Produit non trouvé");

    res.json(withImageUrl(product));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// UPDATE PRODUCT (admin ou vendeur propriétaire)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await productModel.getProductById(id);
    if (!existing) return res.status(404).send("Produit non trouvé");

    if (req.user.role !== "admin" && existing.seller_id !== req.user.id) {
      return res.status(403).send("Accès refusé : ce produit ne vous appartient pas");
    }

    const { name, description, price, quantity, category } = req.body;
    const image = req.file ? req.file.filename : undefined;

    // Validate category if provided
    if (category) {
      const validCategories = await categoryModel.getCategories();
      if (!validCategories.some((c) => c.name === category)) {
        return res.status(400).send("Catégorie invalide");
      }
    }

    const updated = await productModel.updateProduct(id, { name, description, price, quantity, image, category });
    if (!updated) return res.status(400).send("Aucun champ à modifier");

    res.json(withImageUrl(updated));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// APPROVE PRODUCT (admin)
const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);
    if (!product) return res.status(404).send("Produit non trouvé");

    const updated = await productModel.approveProduct(id);
    res.json({ message: "Produit approuvé", product: withImageUrl(updated) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// REJECT PRODUCT (admin)
const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);
    if (!product) return res.status(404).send("Produit non trouvé");

    const updated = await productModel.rejectProduct(id);
    res.json({ message: "Produit refusé", product: withImageUrl(updated) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// DELETE PRODUCT (admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.deleteProduct(id);

    if (!product) return res.status(404).send("Produit non trouvé");

    res.json({ message: "Produit supprimé", product });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// VENDEUR STATS
const getVendeurStats = async (req, res) => {
  try {
    const { summary, products } = await productModel.getVendeurStats(req.user.id);
    const withUrls = products.map((p) => ({ ...p, image: p.image ? `${BASE_URL}/uploads/${p.image}` : null }));
    res.json({ summary, products: withUrls });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createProduct,
  getProducts,
  getAllProductsAdmin,
  getMyProducts,
  getPendingProducts,
  getProductById,
  updateProduct,
  approveProduct,
  rejectProduct,
  deleteProduct,
  getVendeurStats,
};
