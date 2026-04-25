const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// REGISTER (public)
router.post("/", userController.createUser);

// GET USERS (admin only)
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  userController.getUsers
);

// 🔹 LOGIN (public)
router.post("/login", userController.loginUser);

module.exports = router;