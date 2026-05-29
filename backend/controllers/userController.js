const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey"; // ⚠️ à déplacer dans .env (faille S1)

// REGISTER — inscription d'un nouvel utilisateur
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Le rôle est TOUJOURS forcé à "client" côté serveur (sécurité)
    if (!name || !email || !password) {
      return res.status(400).send("Nom, email et mot de passe sont requis");
    }

    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).send("Email already exists");
    }

    const user = await userModel.createUser(name, email, password, "client");
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET USERS
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// LOGIN
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

// REQUEST ROLE — un client demande à devenir vendeur ou livreur
const requestRole = async (req, res) => {
  try {
    const userId = req.user.id; // fourni par authMiddleware
    const { requested_role } = req.body;

    if (requested_role !== "vendeur" && requested_role !== "livreur") {
      return res.status(400).send("Le rôle demandé doit être 'vendeur' ou 'livreur'");
    }

    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    if (user.role !== "client") {
      return res.status(400).send("Seul un client peut demander un changement de rôle");
    }

    if (user.pending_role_status === "pending") {
      return res.status(400).send("Vous avez déjà une demande en cours");
    }

    const updated = await userModel.updatePendingRole(userId, requested_role, "pending");

    res.json({
      message: "Demande envoyée, en attente de validation par l'admin",
      user: updated,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// GET ROLE REQUESTS — l'admin liste les demandes en attente
const getRoleRequests = async (req, res) => {
  try {
    const requests = await userModel.getPendingRoleRequests();
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// APPROVE ROLE REQUEST — l'admin accepte la demande d'un utilisateur
const approveRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    if (user.pending_role_status !== "pending") {
      return res.status(400).send("Aucune demande en attente pour cet utilisateur");
    }

    const updated = await userModel.approveRole(id);
    res.json({
      message: `Rôle '${updated.role}' accordé à ${updated.name}`,
      user: updated,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// REJECT ROLE REQUEST — l'admin refuse la demande d'un utilisateur
const rejectRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    if (user.pending_role_status !== "pending") {
      return res.status(400).send("Aucune demande en attente pour cet utilisateur");
    }

    const updated = await userModel.rejectRole(id);
    res.json({
      message: `Demande de rôle refusée pour ${updated.name}`,
      user: updated,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createUser,
  getUsers,
  loginUser,
  requestRole,
  getRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
};