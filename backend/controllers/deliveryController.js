const deliveryModel    = require("../models/deliveryModel");
const reservationModel = require("../models/reservationModel");
const userModel        = require("../models/userModel");
const mailer           = require("../utils/mailer");

const ALLOWED_STATUSES = ["pending", "accepted", "in_progress", "delivered"];

// REQUEST DELIVERY — le client demande une livraison pour sa réservation
const requestDelivery = async (req, res) => {
  try {
    const { reservation_id } = req.body;
    if (!reservation_id) return res.status(400).send("reservation_id est requis");

    // Vérifier que la réservation existe et appartient au client connecté
    const reservation = await reservationModel.getReservationById(reservation_id);
    if (!reservation) return res.status(404).send("Réservation non trouvée");
    if (reservation.user_id !== req.user.id) {
      return res.status(403).send("Cette réservation ne vous appartient pas");
    }
    if (reservation.status === "cancelled") {
      return res.status(400).send("Impossible de demander une livraison pour une réservation annulée");
    }

    // Vérifier qu'aucune livraison n'existe déjà pour cette réservation
    const existing = await deliveryModel.getDeliveryByReservation(reservation_id);
    if (existing) {
      return res.status(400).send("Une livraison a déjà été demandée pour cette réservation");
    }

    const { lat, lng } = req.body;
    const delivery = await deliveryModel.requestDelivery(reservation_id, lat, lng);
    res.status(201).json({ message: "Demande de livraison envoyée au vendeur", delivery });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// GET CLIENT DELIVERIES — le client voit l'état de ses demandes de livraison
const getClientDeliveries = async (req, res) => {
  try {
    const deliveries = await deliveryModel.getDeliveriesForClient(req.user.id);
    const withImages = deliveries.map((d) => ({
      ...d,
      product_image: d.product_image ? `${BASE_URL}/uploads/${d.product_image}` : null,
    }));
    res.json(withImages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET VENDEUR DELIVERY REQUESTS — le vendeur voit les demandes en attente pour ses produits
const getVendeurDeliveries = async (req, res) => {
  try {
    const deliveries = await deliveryModel.getDeliveriesForVendeur(req.user.id);
    res.json(deliveries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// VENDEUR APPROVE — approuve la livraison → devient disponible pour les livreurs
const vendeurApproveDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await deliveryModel.getDeliveryById(id);
    if (!delivery) return res.status(404).send("Livraison non trouvée");
    if (delivery.status !== "awaiting_vendeur") {
      return res.status(400).send("Cette livraison n'est pas en attente de votre approbation");
    }
    const updated = await deliveryModel.vendeurApproveDelivery(id);
    res.json({ message: "Livraison approuvée — disponible pour les livreurs", delivery: updated });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// VENDEUR REJECT — refuse la demande de livraison
const vendeurRejectDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await deliveryModel.getDeliveryById(id);
    if (!delivery) return res.status(404).send("Livraison non trouvée");
    if (delivery.status !== "awaiting_vendeur") {
      return res.status(400).send("Cette livraison n'est pas en attente de votre approbation");
    }
    const updated = await deliveryModel.vendeurRejectDelivery(id);
    res.json({ message: "Livraison refusée", delivery: updated });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// CREATE DELIVERY (admin) — crée directement sans passer par le vendeur
const createDelivery = async (req, res) => {
  try {
    const { reservation_id } = req.body;
    if (!reservation_id) return res.status(400).send("reservation_id est requis");
    const delivery = await deliveryModel.createDelivery(reservation_id);
    res.status(201).json(delivery);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET AVAILABLE DELIVERIES — livraisons approuvées par le vendeur, sans livreur assigné
const getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await deliveryModel.getAvailableDeliveries();
    res.json(deliveries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET MY DELIVERIES (livreur)
const getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await deliveryModel.getDeliveriesByLivreur(req.user.id);
    res.json(deliveries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// ACCEPT DELIVERY — le livreur s'assigne une livraison disponible
const acceptDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le livreur est disponible
    const { rows: userRows } = await require("../db").query(
      "SELECT available FROM users WHERE id = $1", [req.user.id]
    );
    if (userRows[0] && !userRows[0].available) {
      return res.status(403).send("Vous êtes marqué comme indisponible — activez votre disponibilité pour accepter des livraisons");
    }

    const delivery = await deliveryModel.getDeliveryById(id);
    if (!delivery) return res.status(404).send("Livraison non trouvée");
    if (delivery.livreur_id !== null) {
      return res.status(400).send("Cette livraison a déjà été acceptée par un livreur");
    }
    const updated = await deliveryModel.acceptDelivery(id, req.user.id);
    res.json({ message: "Livraison acceptée", delivery: updated });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// UPDATE DELIVERY STATUS (livreur assigné)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).send(`Statut invalide. Valeurs acceptées : ${ALLOWED_STATUSES.join(", ")}`);
    }

    const delivery = await deliveryModel.getDeliveryById(id);
    if (!delivery) return res.status(404).send("Livraison non trouvée");

    if (delivery.livreur_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Accès refusé : vous n'êtes pas assigné à cette livraison");
    }

    const updated = await deliveryModel.updateDeliveryStatus(id, status);

    // Email "en route" au client
    if (status === "in_progress" && delivery.client_id) {
      const [client, livreur] = await Promise.all([
        userModel.getMe(delivery.client_id),
        userModel.getUserById(req.user.id),
      ]);
      if (client?.email) {
        const tpl = mailer.deliveryInProgress({
          clientName:  client.name,
          productName: delivery.product_name || "votre commande",
          livreurName: livreur?.name || "Le livreur",
        });
        mailer.sendMail({ to: client.email, ...tpl });
      }
    }

    res.json({ message: "Statut mis à jour", delivery: updated });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// UPDATE DELIVERY POSITION (GPS)
const updateDeliveryPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).send("lat et lng sont requis");
    }

    const delivery = await deliveryModel.getDeliveryById(id);
    if (!delivery) return res.status(404).send("Livraison non trouvée");

    if (delivery.livreur_id !== req.user.id) {
      return res.status(403).send("Accès refusé : vous n'êtes pas assigné à cette livraison");
    }

    const updated = await deliveryModel.updateDeliveryPosition(id, lat, lng);
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET ALL DELIVERIES (admin) — lecture seule, vue complète
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await deliveryModel.getAllDeliveries();
    res.json(deliveries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  requestDelivery,
  getClientDeliveries,
  getVendeurDeliveries,
  vendeurApproveDelivery,
  vendeurRejectDelivery,
  createDelivery,
  getAvailableDeliveries,
  getMyDeliveries,
  acceptDelivery,
  updateDeliveryStatus,
  updateDeliveryPosition,
  getAllDeliveries,
};
