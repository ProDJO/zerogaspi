const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Middleware inline : admin ou vendeur uniquement
const vendeurOrAdminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "vendeur") {
    return res.status(403).send("Accès refusé : rôle vendeur ou admin requis");
  }
  next();
};

// ── Routes spécifiques AVANT /:id pour éviter les conflits ──

// GET ALL APPROVED PRODUCTS (public — catalogue)
router.get("/", productController.getProducts);

// GET MY PRODUCTS (vendeur — tous ses produits tous statuts)
router.get("/mine", authMiddleware, vendeurOrAdminMiddleware, productController.getMyProducts);

// GET PENDING PRODUCTS (admin — file d'attente)
router.get("/pending", authMiddleware, adminMiddleware, productController.getPendingProducts);

// GET ALL PRODUCTS FOR ADMIN (admin — tous statuts)
router.get("/all", authMiddleware, adminMiddleware, productController.getAllProductsAdmin);

// GET VENDEUR STATS (vendeur — ses propres stats)
router.get("/vendeur-stats", authMiddleware, vendeurOrAdminMiddleware, productController.getVendeurStats);

// GET PRODUCT BY ID (public)
router.get("/:id", productController.getProductById);

// CREATE PRODUCT (admin ou vendeur + image upload)
router.post("/", authMiddleware, vendeurOrAdminMiddleware, upload.single("image"), productController.createProduct);

// UPDATE PRODUCT (admin ou vendeur propriétaire + image optionnelle)
router.put("/:id", authMiddleware, upload.single("image"), productController.updateProduct);

// APPROVE PRODUCT (admin)
router.put("/:id/approve", authMiddleware, adminMiddleware, productController.approveProduct);

// REJECT PRODUCT (admin)
router.put("/:id/reject", authMiddleware, adminMiddleware, productController.rejectProduct);

// DELETE PRODUCT (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;
