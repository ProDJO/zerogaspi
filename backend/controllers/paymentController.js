const pool          = require("../db");
const productModel  = require("../models/productModel");
const reservationModel = require("../models/reservationModel");

const FLOUCI_BASE    = "https://developers.flouci.com/api";
const FRONTEND_URL   = process.env.FRONTEND_URL || "http://localhost:5173";

// POST /payments/checkout
// Crée un paiement Flouci et retourne l'URL de redirection
const createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send("Le panier est vide");
    }

    // Vérifier les produits et calculer le total côté serveur (ne jamais faire confiance au client)
    let totalMillimes = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await productModel.getProductById(item.product_id);
      if (!product) {
        return res.status(404).send(`Produit #${item.product_id} introuvable`);
      }
      if (product.quantity < item.quantity) {
        return res.status(400).send(`Stock insuffisant pour "${product.name}"`);
      }
      // Flouci utilise les millimes (1 DT = 1000 millimes)
      totalMillimes += Math.round(Number(product.price) * 1000) * item.quantity;
      validatedItems.push({ product_id: item.product_id, quantity: item.quantity });
    }

    const trackingId = `ZG-${req.user.id}-${Date.now()}`;

    // Créer le paiement Flouci
    const flouciRes = await fetch(`${FLOUCI_BASE}/generate_payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_token:             process.env.FLOUCI_APP_TOKEN,
        app_secret:            process.env.FLOUCI_APP_SECRET,
        amount:                totalMillimes,
        accept_card:           true,
        session_timeout_secs:  1200,
        success_link:          `${FRONTEND_URL}/payment/success`,
        fail_link:             `${FRONTEND_URL}/payment/cancel`,
        developer_tracking_id: trackingId,
      }),
    });

    const flouciData = await flouciRes.json();

    if (!flouciData.success || !flouciData.payment_id) {
      console.error("Flouci error:", flouciData);
      return res.status(502).send("Erreur lors de la création du paiement Flouci");
    }

    // Stocker les items en attente en DB (Flouci n'a pas de metadata comme Stripe)
    await pool.query(
      "INSERT INTO pending_payments (payment_id, user_id, items) VALUES ($1, $2, $3)",
      [flouciData.payment_id, req.user.id, JSON.stringify(validatedItems)]
    );

    res.json({ url: flouciData.link, payment_id: flouciData.payment_id });
  } catch (err) {
    console.error("createCheckoutSession error:", err.message);
    res.status(500).send("Erreur serveur");
  }
};

// POST /payments/verify
// Appelé par la page succès avec { payment_id }
// Vérifie le paiement avec Flouci puis crée les réservations
const verifyAndReserve = async (req, res) => {
  try {
    const { payment_id } = req.body;
    if (!payment_id) return res.status(400).send("payment_id manquant");

    // Récupérer la commande en attente
    const { rows } = await pool.query(
      "SELECT * FROM pending_payments WHERE payment_id = $1",
      [payment_id]
    );
    const pending = rows[0];
    if (!pending) return res.status(404).send("Paiement introuvable");
    if (pending.processed) return res.status(409).send("Paiement déjà traité");

    // Vérifier que la session appartient bien à l'utilisateur connecté
    if (pending.user_id !== req.user.id) {
      return res.status(403).send("Accès non autorisé");
    }

    // Vérifier le statut avec Flouci
    const verifyRes = await fetch(`${FLOUCI_BASE}/verify_payment/${payment_id}`, {
      method: "GET",
      headers: {
        apppublic: process.env.FLOUCI_APP_TOKEN,
        appsecret: process.env.FLOUCI_APP_SECRET,
      },
    });

    const verifyData = await verifyRes.json();

    if (verifyData.result?.status !== "SUCCESS") {
      return res.status(402).send("Paiement non confirmé par Flouci");
    }

    // Marquer comme traité immédiatement (idempotence — empêche double réservation)
    await pool.query(
      "UPDATE pending_payments SET processed = TRUE WHERE payment_id = $1",
      [payment_id]
    );

    // Créer les réservations
    const created = [];
    for (const item of pending.items) {
      const product = await productModel.getProductById(item.product_id);
      if (!product || product.quantity < item.quantity) continue;

      const reservation = await reservationModel.createReservation(
        req.user.id,
        item.product_id,
        item.quantity
      );
      await productModel.updateProductQuantity(
        item.product_id,
        product.quantity - item.quantity
      );
      created.push(reservation);
    }

    res.json({ message: "Paiement confirmé — réservations créées", reservations: created });
  } catch (err) {
    console.error("verifyAndReserve error:", err.message);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = { createCheckoutSession, verifyAndReserve };
