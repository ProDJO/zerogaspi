const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middleware/authMiddleware");


// créer réservation
router.post("/", authMiddleware, reservationController.reserveProduct);
router.delete("/:id", authMiddleware, reservationController.cancelReservation);
// GET mes réservations
router.get("/me", authMiddleware, reservationController.getMyReservations);

module.exports = router;