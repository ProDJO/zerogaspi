const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey"; // à mettre dans .env plus tard

//CREATE USER
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    //validation 
    if (!name || !email || !password || !role) {
      return res.status(400).send("All fields are required");
    }

    //vérifier si email existe déjà
    const existingUser = await userModel.getUserByEmail(email);

    if (existingUser) {
      return res.status(400).send("Email already exists");
    }

    //créer utilisateur (hash fait dans model)
    const user = await userModel.createUser(name, email, password, role);

    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

//GET USERS
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createUser,
  getUsers,
  loginUser,
};