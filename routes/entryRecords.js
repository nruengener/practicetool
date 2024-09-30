const express = require('express');
const router = express.Router();
const EntryRecord = require('../models/EntryRecord');

router.get('/:dateRange', async (req, res, next) => {
  try {
    const { dateRange } = req.params;
    let startDate;

    switch (dateRange) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return res.status(400).json({ message: 'Invalid date range' });
    }

    const entryRecords = await EntryRecord.find({
      date: { $gte: startDate }
    }).populate('entry');

    res.json(entryRecords);
  } catch (error) {
    next(error);
  }
});

module.exports = router;