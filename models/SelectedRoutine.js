const mongoose = require('mongoose');

const SelectedRoutineSchema = new mongoose.Schema({
  routine: { type: mongoose.Schema.Types.ObjectId, ref: 'Routine', required: true },
});

module.exports = mongoose.model('SelectedRoutine', SelectedRoutineSchema);
