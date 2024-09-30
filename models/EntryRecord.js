const mongoose = require('mongoose');

const EntryRecordSchema = new mongoose.Schema({
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalTime: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('EntryRecord', EntryRecordSchema);