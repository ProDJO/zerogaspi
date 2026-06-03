const express   = require("express");
const router     = express.Router();
const rateLimit  = require("express-rate-limit");

const userController  = require("../controllers/userController");
const authMiddleware  = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload          = require("../middleware/uploadMiddleware");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Trop de tentatives — réessayez dans 15 minutes.",
});

// REGISTER (public, rate-limited)
router.post("/", authLimiter, userController.createUser);

// LOGIN (public, rate-limited)
router.post("/login", authLimiter, userController.loginUser);

// GET MON PROFIL (utilisateur connecté)
router.get("/me", authMiddleware, userController.getMe);

// UPLOAD AVATAR (utilisateur connecté)
router.put("/avatar",           authMiddleware, upload.single("avatar"), userController.uploadAvatar);

// TOGGLE AVAILABILITY (livreur)
router.patch("/availability",   authMiddleware, userController.toggleAvailability);

// CHANGE PASSWORD
router.put("/password",         authMiddleware, userController.changePassword);

// UPDATE DEFAULT ADDRESS
router.put("/default-address",  authMiddleware, userController.updateDefaultAddress);

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
