const express = require('express');
const router = express.Router();
const SelectedRoutine = require('../models/SelectedRoutine');

// Set the selected routine
router.post('/:id/select', async (req, res) => {
  try {
    await SelectedRoutine.deleteMany({});
    const selectedRoutine = new SelectedRoutine({ routine: req.params.id });
    await selectedRoutine.save();
    res.json({ message: 'Routine selected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get the selected routine
router.get('/', async (req, res) => {
  try {
    const selectedRoutine = await SelectedRoutine.findOne().populate({
      path: 'routine',
      populate: { path: 'entries' },
    });
    res.json(selectedRoutine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
