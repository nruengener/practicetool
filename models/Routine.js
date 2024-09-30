const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }],
});

module.exports = mongoose.model('Routine', RoutineSchema);
