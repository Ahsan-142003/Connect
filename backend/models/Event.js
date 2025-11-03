const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },         
  audience: {
    type: String,
    enum: ['Student', 'Alumni', 'Both'],          
    default: 'Both',
    required: true
  },
  images: [String],
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
