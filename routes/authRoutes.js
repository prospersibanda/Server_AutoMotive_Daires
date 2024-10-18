const express = require('express');
const multer = require('multer');
const { signup, login } = require('../controllers/authController');

const router = express.Router();
const upload = multer({ dest: 'uploads/profilePics' });

router.post('/signup', upload.single('profilePic'), signup);
router.post('/login', login);

module.exports = router;
