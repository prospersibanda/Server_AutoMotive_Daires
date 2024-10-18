const fs = require('fs-extra');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const usersDir = path.join(__dirname, '../data/users');
const profilePicDir = path.join(__dirname, '../uploads/profilePics');

// Signup handler
exports.signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const profilePic = req.file; // Uploaded image file

    if (!profilePic) {
      return res.status(400).json({ message: 'Profile picture is required' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user data
    const newUser = {
      id: Date.now().toString(), // Use a unique ID based on timestamp
      fullname,
      email,
      password: hashedPassword, // Save hashed password
      profilePic: profilePic.filename, // Save the profile picture filename
    };

    // Save user to a JSON file (e.g., user_123.json)
    const userFile = path.join(usersDir, `${newUser.id}.json`);
    await fs.writeJson(userFile, newUser);

    // Respond with success message and user data
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error signing up user', error: error.message });
  }
};

// Login handler
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await fs.readdir(usersDir);

    for (const file of users) {
      const userData = await fs.readJson(path.join(usersDir, file));
      if (userData.email === email) {
        // Compare password with hashed password in the user data
        const isMatch = await bcrypt.compare(password, userData.password);
        if (isMatch) {
          // Generate a JWT token with the user's ID
          const token = jwt.sign({ id: userData.id }, 'secretkey', { expiresIn: '1h' });
          return res.json({ token, user: userData });
        }
      }
    }

    // If no match found, respond with an error
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};
