const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Construit l'URL complète de l'avatar si elle existe
function withAvatarUrl(user) {
  if (user?.avatar) {
    user.avatar = `${BASE_URL}/uploads/${user.avatar}`;
  }
  return user;
}

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

// GET ME — profil de l'utilisateur connecté (avatar inclus)
const getMe = async (req, res) => {
  try {
    const user = await userModel.getMe(req.user.id);
    if (!user) return res.status(404).send("Utilisateur non trouvé");
    res.json(withAvatarUrl(user));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// UPLOAD AVATAR — l'utilisateur connecté change sa photo de profil
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("Aucun fichier fourni");

    const user = await userModel.updateAvatar(req.user.id, req.file.filename);
    res.json(withAvatarUrl(user));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// TOGGLE AVAILABILITY (livreur)
const toggleAvailability = async (req, res) => {
  try {
    if (req.user.role !== "livreur") return res.status(403).send("Réservé aux livreurs");
    const result = await userModel.toggleAvailability(req.user.id);
    res.json({ available: result.available });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).send("Les deux mots de passe sont requis");
    if (newPassword.length < 6) return res.status(400).send("Le nouveau mot de passe doit faire au moins 6 caractères");

    const hash = await userModel.getPasswordHash(req.user.id);
    const valid = await bcrypt.compare(currentPassword, hash);
    if (!valid) return res.status(401).send("Mot de passe actuel incorrect");

    const newHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(req.user.id, newHash);
    res.json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// UPDATE DEFAULT ADDRESS
const updateDefaultAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const user = await userModel.updateDefaultAddress(req.user.id, address || null);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createUser,
  getUsers,
  loginUser,
  getMe,
  uploadAvatar,
  requestRole,
  getRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  changePassword,
  updateDefaultAddress,
  toggleAvailability,
};