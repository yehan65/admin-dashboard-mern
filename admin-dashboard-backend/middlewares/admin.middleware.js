const jwt = require("jsonwebtoken");
require("dotenv").config();

function adminOnly(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send("Acess denied. No token provided");
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decode;
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized access!" });
    }
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
}

module.exports = adminOnly;
