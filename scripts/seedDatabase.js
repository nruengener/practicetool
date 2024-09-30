require('dotenv').config();
const mongoose = require('mongoose');
const Entry = require('../models/Entry');
const Routine = require('../models/Routine');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing data
    await Entry.deleteMany({});
    await Routine.deleteMany({});

    // Create some entries
    const entry1 = await Entry.create({ name: 'Scales', description: 'Practice major and minor scales', scheduledTime: 15 });
    const entry2 = await Entry.create({ name: 'Arpeggios', description: 'Practice major and minor arpeggios', scheduledTime: 10 });
    const entry3 = await Entry.create({ name: 'Sight Reading', description: 'Practice sight reading', scheduledTime: 20 });

    // Create a routine
    await Routine.create({
      name: 'Daily Warm-up',
      entries: [entry1._id, entry2._id, entry3._id]
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();