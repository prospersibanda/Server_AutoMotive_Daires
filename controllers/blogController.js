const fs = require('fs-extra');
const path = require('path');

const blogsDir = path.join(__dirname, '../data/blogs');
const usersDir = path.join(__dirname, '../data/users');
const blogImageDir = path.join(__dirname, '../uploads/blogImages');

// Helper function to get user by ID
const getUserById = async (userId) => {
  const userFile = `${usersDir}/${userId}.json`;
  if (await fs.pathExists(userFile)) {
    return await fs.readJson(userFile);
  }
  return null;
};

// Create a blog post
exports.createBlog = async (req, res) => {
  try {
    const { title, description, content, category } = req.body;
    const blogImage = req.file;
    const datePosted = new Date();

    // Ensure content and blogImage exist
    if (!content || !blogImage) {
      return res.status(400).json({ message: 'Content and image are required' });
    }

    // Fetch the author (user) details from req.user
    const userId = req.user; // Assuming req.user contains the authenticated user ID
    const user = await getUserById(userId.id); // Fetch user details from the file system or database

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const readTime = Math.ceil(content.split(' ').length / 200); // 200 words per minute

    const blog = {
      id: Date.now(),
      title,
      description,
      content,
      category,
      author: {
        name: user.fullname,
        profilePicture: `${req.protocol}://${req.get('host')}/uploads/profilePics/${user.profilePic}`, // Full URL for the author's profile picture
      },
      datePosted,
      readTime,
      image: `${req.protocol}://${req.get('host')}/uploads/blogImages/${blogImage.filename}`, // Full URL for the blog image
      likes: 0,
      shares: 0,
      comments: [],
      bookmarks: [],
    };

    await fs.writeJson(`${blogsDir}/${blog.id}.json`, blog);

    res.status(201).json({ message: 'Blog created successfully', blog });
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog', error: error.message });
  }
};


// Get all blogs
// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    console.log("Reading blogs from directory:", blogsDir); // Debugging: Log the directory being read
    const blogs = await fs.readdir(blogsDir);

    console.log("Blogs found:", blogs); // Debugging: Log the blog filenames found

    const allBlogs = [];

    for (const file of blogs) {
      const blogData = await fs.readJson(`${blogsDir}/${file}`);
      console.log("Blog data read from file:", blogData); // Debugging: Log each blog data
      allBlogs.push(blogData);
    }

    res.json(allBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error.message); // Debugging: Log any errors
    res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
};


// Like or unlike a blog post
exports.likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blogFile = `${blogsDir}/${blogId}.json`;
    const userId = req.user; // Extracted from the auth middleware

    if (await fs.pathExists(blogFile)) {
      const blog = await fs.readJson(blogFile);

      // Ensure blog.likes is an array
      if (!Array.isArray(blog.likes)) {
        blog.likes = [];
      }

      // Check if user has already liked the blog
      const hasLiked = blog.likes.includes(userId);

      if (hasLiked) {
        // If the user has already liked it, unlike it
        blog.likes = blog.likes.filter((id) => id !== userId);
      } else {
        // If the user hasn't liked it, add their like
        blog.likes.push(userId);
      }

      await fs.writeJson(blogFile, blog);

      // Return updated like information
      res.json({
        message: hasLiked ? 'Blog unliked successfully' : 'Blog liked successfully',
        likes: blog.likes.length,      // Updated number of likes
        userHasLiked: !hasLiked,       // Reflect the current like status of the user
      });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({ message: 'Error liking blog', error: error.message });
  }
};




// Add a comment to a blog post
exports.addComment = async (req, res) => {
  try {
    console.log('User making the comment:', req.user); // Check if user is attached

    const blogId = req.params.id;
    console.log('Blog ID:', blogId); // Log the blog ID

    const blogFile = `${blogsDir}/${blogId}.json`;
    const { text } = req.body;
    console.log('Comment text:', text); // Log the comment text

    const user = req.user; // Extracted full user object from the auth middleware

    if (await fs.pathExists(blogFile)) {
      const blog = await fs.readJson(blogFile);

      const comment = {
        id: Date.now(),
        text,
        authorName: user.fullname, // Fullname from the logged-in user
        authorProfilePic: user.profilePic, // Profile picture from logged-in user
        dateCommented: new Date(),
      };

      blog.comments.push(comment);
      await fs.writeJson(blogFile, blog);

      console.log('Comment added successfully:', comment); // Log the added comment
      res.json({ message: 'Comment added successfully', comment });
    } else {
      console.log('Blog not found'); // Log if blog file not found
      return res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    console.log('Error adding comment:', error); // Log the error
    return res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Get comments for a blog post
exports.getComments = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blogFile = `${blogsDir}/${blogId}.json`;

    // Ensure blog file exists
    if (await fs.pathExists(blogFile)) {
      const blog = await fs.readJson(blogFile);
      
      // Return the blog's comments array
      res.json(blog.comments);
    } else {
      return res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

// Delete a blog post
exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blogFilePath = `${blogsDir}/${blogId}.json`;

    if (await fs.pathExists(blogFilePath)) {
      await fs.remove(blogFilePath);
      res.json({ message: 'Blog deleted successfully' });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
};

// Get trending blogs (assuming trending blogs have 100+ likes)
exports.getTrendingBlogs = async (req, res) => {
  try {
    const blogs = await fs.readdir(blogsDir);
    const trendingBlogs = [];

    for (const file of blogs) {
      const blogData = await fs.readJson(`${blogsDir}/${file}`);
      if (blogData.likes >= 100) { // Adjust the criteria for trending as needed
        trendingBlogs.push(blogData);
      }
    }

    res.json(trendingBlogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending blogs', error: error.message });
  }
};
