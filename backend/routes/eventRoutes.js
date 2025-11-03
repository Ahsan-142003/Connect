const express = require("express");
const router = express.Router();
const multer = require("multer");
const Event = require("../models/Event");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// POST /api/events/upload
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, date, time, audience } = req.body;
    const images = req.files.map(file => file.filename);

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      audience,
      images
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while uploading event' });
  }
});

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});


// Delete event
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



// Edit Events
router.put("/:id", upload.array("newImages", 10), async (req, res) => {
  try {
    const { title, date, time, audience, description } = req.body;
    let images = req.body.existingImages || [];

    // If only one existingImage was sent, convert to array
    if (typeof images === "string") {
      images = [images];
    }

    // Add new uploaded image filenames
    if (req.files && req.files.length > 0) {
      const newImageNames = req.files.map((f) => f.filename);
      images = images.concat(newImageNames);
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { title, date, time, audience, description, images },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update event" });
  }
});



module.exports = router;
