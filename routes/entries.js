const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// Create a new entry
router.post('/', async (req, res) => {
  try {
    const { name, description, scheduledTime } = req.body;
    const entry = new Entry({ name, description, scheduledTime });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all entries
router.get('/', async (req, res) => {
  try {
    const entries = await Entry.find();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an entry
router.put('/:id', async (req, res) => {
  try {
    const { name, description, scheduledTime } = req.body;
    const entry = await Entry.findByIdAndUpdate(
      req.params.id,
      { name, description, scheduledTime },
      { new: true }
    );
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an entry
router.delete('/:id', async (req, res) => {
  try {
    await Entry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
