const adminMiddleware = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send("Access denied: Admin only");
    }

    next();
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

module.exports = adminMiddleware;