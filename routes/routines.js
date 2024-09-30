const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');

// Create a new routine
router.post('/', async (req, res) => {
  try {
    const { name, entries } = req.body;
    const routine = new Routine({ name, entries });
    await routine.save();
    res.status(201).json(routine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all routines
router.get('/', async (req, res) => {
  try {
    const routines = await Routine.find().populate('entries');
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a routine
router.put('/:id', async (req, res) => {
  try {
    const { name, entries } = req.body;
    const routine = await Routine.findByIdAndUpdate(
      req.params.id,
      { name, entries },
      { new: true }
    ).populate('entries');
    res.json(routine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a routine
router.delete('/:id', async (req, res) => {
  try {
    await Routine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Routine deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
