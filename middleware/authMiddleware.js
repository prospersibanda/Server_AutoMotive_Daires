const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const path = require('path');

const usersDir = path.join(__dirname, '../data/users');

// Helper to get user data from token
exports.protect = async (req, res, next) => {
  console.log('Protect middleware reached'); // This should log on every request

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or incorrect format'); // Log missing token issue
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token

  try {
    console.log('Verifying token:', token); // Log the token
    const decoded = jwt.verify(token, 'secretkey'); // Verify token
    console.log('Token decoded:', decoded); // Log the decoded token

    const userFile = `${usersDir}/${decoded.id}.json`;
    if (await fs.pathExists(userFile)) {
      const user = await fs.readJson(userFile);
      req.user = user;
      console.log('User attached to request:', req.user); // Log the attached user
      next();
    } else {
      console.log('User not found'); // Log if user file not found
      res.status(401).json({ message: 'User not found' });
    }
  } catch (error) {
    console.log('Token verification failed', error); // Log the error
    res.status(401).json({ message: 'Invalid token' });
  }
};

