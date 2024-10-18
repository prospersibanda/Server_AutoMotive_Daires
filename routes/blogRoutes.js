const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createBlog,
  getAllBlogs,
  getTrendingBlogs,
  deleteBlog,
  likeBlog,
  addComment,
  getComments,
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/blogImages'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);  // Get the file extension
    const fileName = `${Date.now()}${ext}`;       // Ensure the filename includes the extension
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

router.post('/create', protect, upload.single('blogImage'), createBlog);
router.get('/all', getAllBlogs);
router.get('/trending', getTrendingBlogs);
router.post('/:id/like', protect, likeBlog);
router.post('/:id/comment', protect, addComment);
router.get('/:id/comments', getComments);
router.delete('/:id', protect, deleteBlog);


const categories = [
  { id: 1, name: 'Sports Cars' },
  { id: 2, name: 'Electric Cars' },
  { id: 3, name: 'Luxury Cars' },
  { id: 4, name: 'SUV' },
];

// Fetch all categories
router.get('/categories', (req, res) => {
  res.json(categories);
});

module.exports = router;
