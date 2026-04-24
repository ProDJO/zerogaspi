const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // vérifier si token existe
    if (!authHeader) {
      return res.status(401).send("Access denied");
    }

    // format: Bearer token
    const token = authHeader.split(" ")[1];

    const verified = jwt.verify(token, SECRET);

    // stocker user dans req
    req.user = verified;

    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
};

module.exports = authMiddleware;