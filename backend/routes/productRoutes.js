const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

//CREATE PRODUCT (admin only)
router.post("/",authMiddleware,adminMiddleware,productController.createProduct);

//GET ALL PRODUCTS (public)
router.get("/", productController.getProducts);

module.exports = router;