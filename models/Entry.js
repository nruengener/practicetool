const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  scheduledTime: { type: Number, required: true }, // Time in minutes
});

module.exports = mongoose.model('Entry', EntrySchema);
