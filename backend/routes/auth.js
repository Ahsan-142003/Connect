const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // ✅ Import bcrypt
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  try {
    const { fullName, registrationNo, email, password, userType } = req.body;

    const existingUser = await User.findOne({ registrationNo });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    console.log("Request body:", req.body);

    // ✅ Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      registrationNo,
      email,
      password: hashedPassword, // store hashed password
      userType,
    });

    await newUser.save();
    console.log("✅ New user saved to DB:", newUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// For login check

router.post("/login", async (req, res) => {
  const { registrationNo, password } = req.body;

  try {
    const user = await User.findOne({ registrationNo });
    if (!user) {
      return res.status(400).json({ error: "Invalid registration number" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        registrationNo: user.registrationNo,
        userType: user.userType,
        profileImage: user.profileImage,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
