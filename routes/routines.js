const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// Create a new routine
router.post('/', async (req, res) => {
  try {
    const { name, entries } = req.body;
    const routine = { name, entries: entries.map(id => new ObjectId(id)) };
    const result = await req.app.locals.db.collection('routines').insertOne(routine);
    res.status(201).json({ ...routine, _id: result.insertedId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all routines
router.get('/', async (req, res) => {
  try {
    const routines = await req.app.locals.db.collection('routines').aggregate([
      {
        $lookup: {
          from: 'entries',
          localField: 'entries',
          foreignField: '_id',
          as: 'entries'
        }
      }
    ]).toArray();
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a routine
router.put('/:id', async (req, res) => {
  try {
    const { name, entries } = req.body;
    const result = await req.app.locals.db.collection('routines').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, entries: entries.map(id => new ObjectId(id)) } },
      { returnDocument: 'after' }
    );
    if (result.value) {
      const updatedRoutine = await req.app.locals.db.collection('routines').aggregate([
        { $match: { _id: result.value._id } },
        {
          $lookup: {
            from: 'entries',
            localField: 'entries',
            foreignField: '_id',
            as: 'entries'
          }
        }
      ]).next();
      res.json(updatedRoutine);
    } else {
      res.status(404).json({ error: 'Routine not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a routine
router.delete('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.db.collection('routines').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 1) {
      res.json({ message: 'Routine deleted' });
    } else {
      res.status(404).json({ error: 'Routine not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
