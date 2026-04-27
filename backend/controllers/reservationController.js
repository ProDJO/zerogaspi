const reservationModel = require("../models/reservationModel");
const productModel = require("../models/productModel");

// réserver un produit
const reserveProduct = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    // validation
    if (!product_id || !quantity) {
      return res.status(400).send("product_id and quantity are required");
    }

    // vérifier produit
    const product = await productModel.getProductById(product_id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // vérifier stock
    if (product.quantity < quantity) {
      return res.status(400).send("Not enough stock");
    }

    // créer réservation
    const reservation = await reservationModel.createReservation(
      user_id,
      product_id,
      quantity
    );

    // décrémenter stock
    await productModel.updateProductQuantity(
      product_id,
      product.quantity - quantity
    );

    res.json({
      message: "Reservation successful",
      reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
};

//annuler une réservation
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // vérifier si la réservation existe
    const reservation = await reservationModel.getReservationById(id);

    if (!reservation) {
      return res.status(404).send("Reservation not found");
    }

    // récupérer le produit lié
    const product = await productModel.getProductById(
      reservation.product_id
    );

    // remettre le stock
    await productModel.updateProductQuantity(
      product.id,
      product.quantity + reservation.quantity
    );

    // supprimer la réservation
    await reservationModel.deleteReservation(id);

    res.json({ message: "Reservation cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
};
//historique utilisateur
const getMyReservations = async (req, res) => {
  try {
    const user_id = req.user.id;

    const reservations = await reservationModel.getReservationsByUser(user_id);

    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  reserveProduct,
  cancelReservation,
  getMyReservations,
};