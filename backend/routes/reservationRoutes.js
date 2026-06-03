const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// GET toutes les réservations (admin)
router.get("/", authMiddleware, adminMiddleware, reservationController.getAllReservations);

// GET mes réservations (utilisateur connecté)
router.get("/me", authMiddleware, reservationController.getMyReservations);

// Créer une réservation
router.post("/", authMiddleware, reservationController.reserveProduct);

// Annuler une réservation
router.delete("/:id", authMiddleware, reservationController.cancelReservation);

module.exports = router;