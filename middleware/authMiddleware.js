const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const path = require('path');

const usersDir = path.join(__dirname, '../data/users');

// Helper to get user data from token
exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part from "Bearer <token>"

  try {
    const decoded = jwt.verify(token, 'secretkey'); // Use the correct secret key here
    const userFile = `${usersDir}/${decoded.id}.json`;

    if (await fs.exists(userFile)) {
      req.user = decoded.id;
      next();
    } else {
      res.status(401).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
