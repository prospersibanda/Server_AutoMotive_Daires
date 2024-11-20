const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// Signup handler
exports.signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const profilePic = req.file ? req.file.filename : null;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    const [result] = await pool.query(
      "INSERT INTO users (fullname, email, password, profilePic) VALUES (?, ?, ?, ?)",
      [fullname, email, hashedPassword, profilePic]
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error signing up user", error: error.message });
  }
};

// Login handler
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user by email
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: "1h" });

    // Return user data excluding the password
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};
