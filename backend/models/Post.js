const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  images: [{ type: String }], // image filenames/URLs
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);
