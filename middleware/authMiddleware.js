const jwt = require("jsonwebtoken");
const pool = require("../db");

// Middleware to protect routes and authenticate users
exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secretkey"); // Verify token

    // Fetch user from database using decoded token ID
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      decoded.id,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = rows[0]; // Attach user to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
