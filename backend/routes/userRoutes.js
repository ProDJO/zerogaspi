const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// REGISTER (public)
router.post("/", userController.createUser);

// LOGIN (public)
router.post("/login", userController.loginUser);

// REQUEST ROLE (utilisateur connecté demande vendeur ou livreur)
router.post("/request-role", authMiddleware, userController.requestRole);

// GET USERS (admin only)
router.get("/", authMiddleware, adminMiddleware, userController.getUsers);

// GET ROLE REQUESTS — liste des demandes en attente (admin only)
router.get("/role-requests", authMiddleware, adminMiddleware, userController.getRoleRequests);

// APPROVE ROLE REQUEST (admin only)
router.put("/role-requests/:id/approve", authMiddleware, adminMiddleware, userController.approveRoleRequest);

// REJECT ROLE REQUEST (admin only)
router.put("/role-requests/:id/reject", authMiddleware, adminMiddleware, userController.rejectRoleRequest);

module.exports = router;