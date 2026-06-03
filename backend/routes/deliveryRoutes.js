const express = require("express");
const router  = express.Router();
const deliveryController = require("../controllers/deliveryController");
const authMiddleware     = require("../middleware/authMiddleware");
const adminMiddleware    = require("../middleware/adminMiddleware");

// Middleware inline : livreur ou admin
const livreurMiddleware = (req, res, next) => {
  if (req.user.role !== "livreur" && req.user.role !== "admin") {
    return res.status(403).send("Accès refusé : rôle livreur requis");
  }
  next();
};

// Middleware inline : vendeur ou admin
const vendeurMiddleware = (req, res, next) => {
  if (req.user.role !== "vendeur" && req.user.role !== "admin") {
    return res.status(403).send("Accès refusé : rôle vendeur requis");
  }
  next();
};

// ── Routes spécifiques AVANT les routes paramétrées ──

// CLIENT — demande une livraison pour sa réservation
router.post("/request", authMiddleware, deliveryController.requestDelivery);

// CLIENT — voit l'état de toutes ses demandes de livraison
router.get("/client", authMiddleware, deliveryController.getClientDeliveries);

// VENDEUR — voit les demandes en attente pour ses produits
router.get("/vendeur-requests", authMiddleware, vendeurMiddleware, deliveryController.getVendeurDeliveries);

// LIVREUR — livraisons disponibles (approuvées par le vendeur, sans livreur)
router.get("/available", authMiddleware, livreurMiddleware, deliveryController.getAvailableDeliveries);

// LIVREUR — ses propres livraisons
router.get("/mine", authMiddleware, livreurMiddleware, deliveryController.getMyDeliveries);

// ADMIN — crée une livraison directement (bypass vendeur)
router.post("/", authMiddleware, adminMiddleware, deliveryController.createDelivery);

// ADMIN — vue lecture seule de toutes les livraisons
router.get("/all", authMiddleware, adminMiddleware, deliveryController.getAllDeliveries);

// ── Routes paramétrées ──

// VENDEUR — approuve la demande → livraison devient disponible pour les livreurs
router.put("/:id/vendeur-approve", authMiddleware, vendeurMiddleware, deliveryController.vendeurApproveDelivery);

// VENDEUR — refuse la demande de livraison
router.put("/:id/vendeur-reject", authMiddleware, vendeurMiddleware, deliveryController.vendeurRejectDelivery);

// LIVREUR — s'assigne une livraison disponible
router.put("/:id/accept", authMiddleware, livreurMiddleware, deliveryController.acceptDelivery);

// LIVREUR — met à jour le statut (in_progress, delivered)
router.patch("/:id/status", authMiddleware, livreurMiddleware, deliveryController.updateDeliveryStatus);

// LIVREUR — envoie ses coordonnées GPS
router.patch("/:id/position", authMiddleware, livreurMiddleware, deliveryController.updateDeliveryPosition);

module.exports = router;
