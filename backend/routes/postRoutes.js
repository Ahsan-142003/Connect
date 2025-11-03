const express = require("express");
const router = express.Router();
const multer = require("multer");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Multer config to save images in /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Unique filename: timestamp + original name
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// CREATE a post with images
router.post("/create", upload.array("images", 5), async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ message: "userId and text are required" });
    }

    // Multer stores files in req.files
    const imageFiles = req.files || [];
    // Map filenames for DB
    const images = imageFiles.map((file) => file.filename);

    const newPost = new Post({ user: userId, text, images });
    const savedPost = await newPost.save();

    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: "Failed to create post", error: err.message });
  }
});



// GET posts by specific user

router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});




// GET all posts
router.get("/all", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate("user", "fullName profileImage");
    res.json({ posts });
  } catch (err) {
    console.error("Error fetching all posts:", err);
    res.status(500).json({ message: "Server error while fetching posts" });
  }
});



// GET posts from friends (and self)
router.get("/friends-posts", async (req, res) => {
  const userId = req.query.userId; // frontend should send ?userId=xxx

  if (!userId) {
    return res.status(400).json({ message: "User ID required" });
  }

  try {
    // Fetch user's friends from DB or hardcode for demo
    const user = await User.findById(userId);

    // Example: get user friends array and include own id
    const userAndFriends = [userId, ...user.friends];

    const posts = await Post.find({ user: { $in: userAndFriends } })
      .populate("user", "fullName profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching posts" });
  }
});



module.exports = router;
