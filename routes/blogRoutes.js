const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createBlog,
  getAllBlogs,
  getTrendingBlogs,
  deleteBlog,
  likeBlog,
  addComment,
  getComments,
} = require("../controllers/blogController"); // Ensure these are correctly imported
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../uploads/blogImages")),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

// Define routes with callback functions
router.post("/create", protect, upload.single("blogImage"), createBlog);
router.get("/all", getAllBlogs); // This route must call `getAllBlogs`
router.get("/trending", getTrendingBlogs); // Ensure the handler exists
router.post("/:id/like", protect, likeBlog);
router.post("/:id/comment", protect, addComment);
router.get("/:id/comments", getComments);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
