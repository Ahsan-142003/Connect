const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Event = require("../models/Event");

const router = express.Router();

// Middleware to get user from token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Send Friend Request
router.post("/send-request/:receiverId", authMiddleware, async (req, res) => {
  try {
    const sender = req.user;
    const receiver = await User.findById(req.params.receiverId);

    if (!receiver) return res.status(404).json({ message: "User not found" });
    if (receiver._id.equals(sender._id)) return res.status(400).json({ message: "Cannot send request to self" });

    if (
      sender.friendRequestsSent.includes(receiver._id) ||
      receiver.friendRequestsReceived.includes(sender._id)
    ) {
      return res.status(400).json({ message: "Request already sent" });
    }

    sender.friendRequestsSent.push(receiver._id);
    receiver.friendRequestsReceived.push(sender._id);

    await sender.save();
    await receiver.save();

    // Emit socket event to receiver
    const io = req.app.locals.io;
    const users = req.app.locals.users;
    const receiverSocketId = users[receiver._id.toString()];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new-friend-request", {
        _id: sender._id,
        fullName: sender.fullName,
        profileImage: sender.profileImage,
      });
    }

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Accept Friend Request
router.post("/accept-request/:senderId", authMiddleware, async (req, res) => {
  try {
    const receiver = req.user;
    const sender = await User.findById(req.params.senderId);

    if (!sender) return res.status(404).json({ message: "Sender not found" });

    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(
      (id) => id.toString() !== sender._id.toString()
    );
    sender.friendRequestsSent = sender.friendRequestsSent.filter(
      (id) => id.toString() !== receiver._id.toString()
    );

    if (!receiver.friends.includes(sender._id)) receiver.friends.push(sender._id);
    if (!sender.friends.includes(receiver._id)) sender.friends.push(receiver._id);

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Reject Friend Request
router.post("/reject-request/:senderId", authMiddleware, async (req, res) => {
  try {
    const receiver = req.user;
    const sender = await User.findById(req.params.senderId);

    if (!sender) return res.status(404).json({ message: "Sender not found" });

    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(
      (id) => id.toString() !== sender._id.toString()
    );
    sender.friendRequestsSent = sender.friendRequestsSent.filter(
      (id) => id.toString() !== receiver._id.toString()
    );

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (excluding current user)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "fullName registrationNo profileImage userType"
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get received friend requests
router.get("/friend-requests", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friendRequestsReceived", "fullName profileImage");
    res.json(user.friendRequestsReceived);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get sent friend requests
router.get("/sent-requests", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friendRequestsSent", "_id");
    res.json(user.friendRequestsSent.map((u) => u._id));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get friend list
router.get("/friends", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", "_id");
    res.json(user.friends.map((u) => u._id));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


// Get logged-in user's info
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});




// Update profile info
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { phone, dateOfBirth, about } = req.body;
    const user = req.user;

    user.phone = phone || "";
    user.dateOfBirth = dateOfBirth || "";
    user.about = about || "";

    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Get friend list with fullName and profileImage populated
// Get friend list with fullName and profileImage populated// ✅ Get friend list with fullName and profileImage populated
// ✅ Correct version of /friends route
// ✅ Yeh rakhna:
// Get friend list (only IDs)
router.get("/friends", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("friends");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.friends);  // array of ObjectIds
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


//////////////////////////////////////////////
// for admin panel show user

router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find().select("fullName email userType createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

////////////////////////////////////////////
// fetch userstats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ userType: "student" });
    const alumni = await User.countDocuments({ userType: "alumni" });

    const totalEvents = await Event.countDocuments();

    res.status(200).json({
      totalUsers,
      students,
      alumni,
      totalEvents,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Get multiple users by IDs (profileImage, fullName)
// user.js (Express router)

router.post('/users-by-ids', async (req, res) => {
  try {
    const { ids } = req.body; // expecting an array of user IDs in req.body.ids
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid or missing ids array' });
    }
    
    const users = await User.find({ _id: { $in: ids } }).select('-password'); // exclude sensitive fields
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
});






