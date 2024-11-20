const pool = require("../db");

// Create a blog post
exports.createBlog = async (req, res) => {
  try {
    const { title, description, content, category } = req.body;
    const blogImage = req.file ? req.file.filename : null;
    const userId = req.user.id; // User ID from auth middleware

    if (!content || !blogImage) {
      return res
        .status(400)
        .json({ message: "Content and image are required" });
    }

    const readTime = Math.ceil(content.split(" ").length / 200); // Estimate read time (200 words/min)

    const [result] = await pool.query(
      "INSERT INTO blogs (title, description, content, category, authorId, blogImage, readTime, datePosted) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [title, description, content, category, userId, blogImage, readTime]
    );

    res
      .status(201)
      .json({ message: "Blog created successfully", blogId: result.insertId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating blog", error: error.message });
  }
};

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM blogs");
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching blogs", error: error.message });
  }
};

// Get trending blogs (e.g., blogs with 100+ likes)
exports.getTrendingBlogs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT blogs.*, COUNT(blog_likes.id) AS likeCount
       FROM blogs
       LEFT JOIN blog_likes ON blogs.id = blog_likes.blogId
       GROUP BY blogs.id
       HAVING likeCount >= 100`
    );
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching trending blogs", error: error.message });
  }
};

// Like or unlike a blog post
exports.likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT * FROM blog_likes WHERE blogId = ? AND userId = ?",
      [blogId, userId]
    );

    if (rows.length > 0) {
      // Unlike the blog
      await pool.query(
        "DELETE FROM blog_likes WHERE blogId = ? AND userId = ?",
        [blogId, userId]
      );
      res.json({ message: "Blog unliked successfully" });
    } else {
      // Like the blog
      await pool.query(
        "INSERT INTO blog_likes (blogId, userId) VALUES (?, ?)",
        [blogId, userId]
      );
      res.json({ message: "Blog liked successfully" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error liking blog", error: error.message });
  }
};

// Add a comment to a blog post
exports.addComment = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { text } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      "INSERT INTO comments (blogId, userId, text, dateCommented) VALUES (?, ?, ?, NOW())",
      [blogId, userId, text]
    );

    res.json({
      message: "Comment added successfully",
      commentId: result.insertId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

// Get comments for a blog post
exports.getComments = async (req, res) => {
  try {
    const blogId = req.params.id;

    const [rows] = await pool.query(
      "SELECT comments.*, users.fullname, users.profilePic FROM comments JOIN users ON comments.userId = users.id WHERE blogId = ?",
      [blogId]
    );

    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
};

// Delete a blog post
exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const [result] = await pool.query("DELETE FROM blogs WHERE id = ?", [
      blogId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting blog", error: error.message });
  }
};
