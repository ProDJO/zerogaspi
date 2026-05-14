const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// CREATE PRODUCT (admin only) + image upload
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  productController.createProduct
);

// GET ALL PRODUCTS (public)
router.get("/", productController.getProducts);

// DELETE PRODUCT (admin only) ✅
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  productController.deleteProduct
);

console.log("PRODUCT ROUTES LOADED");

module.exports = router;