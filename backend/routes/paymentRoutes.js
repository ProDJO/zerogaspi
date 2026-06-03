const express = require("express");
const router  = express.Router();
const authMiddleware     = require("../middleware/authMiddleware");
const paymentController  = require("../controllers/paymentController");

// Créer une session Stripe Checkout
router.post("/checkout", authMiddleware, paymentController.createCheckoutSession);

// Vérifier le paiement et créer les réservations
router.post("/verify",   authMiddleware, paymentController.verifyAndReserve);

module.exports = router;
