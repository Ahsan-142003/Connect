const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  registrationNo: String,
  email: String,
  password: String,
  userType: String,
  profileImage: {
    type: String,
    default: "",
  },

  phone: { type: String, default: "" },
  dateOfBirth: { type: String, default: "" },
  about: { type: String, default: "" },



friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
