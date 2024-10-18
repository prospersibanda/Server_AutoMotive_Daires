const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const cors = require('cors');

const app = express();
app.use(cors());

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
