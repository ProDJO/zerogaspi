const productModel = require("../models/productModel");

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    if (!name && !price) {
      return res.status(400).send("Name and price are required");
    }
    if (!name) {
      return res.status(400).send("Name is required");
    }
    if (!price) {
      return res.status(400).send("Price is required");
    }
    const product = await productModel.createProduct(
      name,
      description,
      price,
      quantity
    );
    product.price = product.price + " DT";
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};
const getProducts = async (req, res) => {
  try {
    const products = await productModel.getProducts();

    products.forEach(p => {
      p.price = p.price + " DT";
    });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createProduct,
  getProducts, // ✅ IMPORTANT
};