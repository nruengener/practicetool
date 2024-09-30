Certainly! Let's start building the application from scratch, editing one file at a time in small steps.

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                           Step 1: Initialize the Project

Action:

 • Create a new project directory and initialize it with Node.js.

Commands:


 mkdir practice-app
 cd practice-app
 npm init -y


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                             Step 2: Set Up the Server

File: server.js

Instructions:

 1 Create a file named server.js at the root of your project directory.
 2 Set up a basic Express server to handle HTTP requests.

Code:


 // server.js

 const express = require('express');
 const app = express();
 const port = process.env.PORT || 5000;

 app.use(express.json());

 // Start the server
 app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
 });


Notes:

 • This sets up a basic Express server listening on port 5000 or the port specified in the environment variables.
 • The server is configured to parse JSON request bodies.

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                            Step 3: Install Dependencies

Action:

 • Install Express and Mongoose for setting up the server and database connection.

Commands:


 npm install express mongoose


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                             Step 4: Connect to MongoDB

Instructions:

 1 Set up a connection to MongoDB using Mongoose in server.js.

Code Addition in server.js:


 // server.js (add after app.use(express.json());)

 const mongoose = require('mongoose');

 // Connect to MongoDB
 mongoose.connect('mongodb://localhost:27017/practice-app', {
   useNewUrlParser: true,
   useUnifiedTopology: true,
 });

 const db = mongoose.connection;
 db.on('error', console.error.bind(console, 'MongoDB connection error:'));
 db.once('open', () => {
   console.log('Connected to MongoDB');
 });


Notes:

 • Replace 'mongodb://localhost:27017/practice-app' with your actual MongoDB connection string if needed.

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                           Step 5: Define the Entry Model

File: models/Entry.js

Instructions:

 1 Create a directory named models.
 2 Within models, create a file named Entry.js.
 3 Define the Entry schema with fields for name, description, and scheduledTime.

Code:


 // models/Entry.js

 const mongoose = require('mongoose');

 const EntrySchema = new mongoose.Schema({
   name: { type: String, required: true },
   description: String,
   scheduledTime: { type: Number, required: true }, // Time in minutes
 });

 module.exports = mongoose.model('Entry', EntrySchema);


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                          Step 6: Define the Routine Model

File: models/Routine.js

Instructions:

 1 Within the models directory, create a file named Routine.js.
 2 Define the Routine schema with a name and an array of entries.

Code:


 // models/Routine.js

 const mongoose = require('mongoose');

 const RoutineSchema = new mongoose.Schema({
   name: { type: String, required: true },
   entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }],
 });

 module.exports = mongoose.model('Routine', RoutineSchema);


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                            Step 7: Create Entry Routes

File: routes/entries.js

Instructions:

 1 Create a directory named routes.
 2 Within routes, create a file named entries.js.
 3 Set up routes to handle CRUD operations for entries.

Code:


 // routes/entries.js

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


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                     Step 8: Integrate Entry Routes into Server

Instructions:

 1 In server.js, import the entry routes.
 2 Use the entry routes in the Express app.

Code Addition in server.js:


 // server.js (add after setting up MongoDB connection)

 const entryRoutes = require('./routes/entries');
 app.use('/entries', entryRoutes);


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                           Step 9: Create Routine Routes

File: routes/routines.js

Instructions:

 1 Within the routes directory, create a file named routines.js.
 2 Set up routes to handle CRUD operations for routines.

Code:


 // routes/routines.js

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


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                   Step 10: Integrate Routine Routes into Server

Instructions:

 1 In server.js, import the routine routes.
 2 Use the routine routes in the Express app.

Code Addition in server.js:


 // server.js (add after entry routes)

 const routineRoutes = require('./routes/routines');
 app.use('/routines', routineRoutes);


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                   Step 11: Implement Currently Selected Routine

File: models/SelectedRoutine.js

Instructions:

 1 Within the models directory, create a file named SelectedRoutine.js.
 2 Define a schema to store the currently selected routine.

Code:


 // models/SelectedRoutine.js

 const mongoose = require('mongoose');

 const SelectedRoutineSchema = new mongoose.Schema({
   routine: { type: mongoose.Schema.Types.ObjectId, ref: 'Routine', required: true },
 });

 module.exports = mongoose.model('SelectedRoutine', SelectedRoutineSchema);


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                      Step 12: Create Selected Routine Routes

File: routes/selectedRoutine.js

Instructions:

 1 Within the routes directory, create a file named selectedRoutine.js.
 2 Set up routes to get and set the currently selected routine.

Code:


 // routes/selectedRoutine.js

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


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                               Step 13: Integrate Selected Routine Routes into Server

Instructions:

 1 In server.js, import the selected routine routes.
 2 Use the selected routine routes in the Express app.

Code Addition in server.js:


 // server.js (add after routine routes)

 const selectedRoutineRoutes = require('./routes/selectedRoutine');
 app.use('/selected-routine', selectedRoutineRoutes);


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                       Step 14: Implement Timer Functionality

Instructions:

 • Since timers are primarily a frontend feature, we'll handle them in the client application.
 • However, we'll need an endpoint to record total times for entries each day.

File: models/DailyEntryRecord.js

Instructions:

 1 Within the models directory, create a file named DailyEntryRecord.js.
 2 Define a schema to record the total time spent on each entry per day.

Code:


 // models/DailyEntryRecord.js

 const mongoose = require('mongoose');

 const DailyEntryRecordSchema = new mongoose.Schema({
   entry: { type: mongoose.Schema.Types.ObjectId, ref: 'Entry', required: true },
   date: { type: Date, required: true },
   totalTime: { type: Number, default: 0 }, // Time in minutes
 });

 module.exports = mongoose.model('DailyEntryRecord', DailyEntryRecordSchema);


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                    Step 15: Create Routes to Record Entry Times

File: routes/entryRecords.js

Instructions:

 1 Within the routes directory, create a file named entryRecords.js.
 2 Set up routes to add time to entries for the day and fetch records.

Code:


 // routes/entryRecords.js

 const express = require('express');
 const router = express.Router();
 const DailyEntryRecord = require('../models/DailyEntryRecord');

 // Add time to an entry for today
 router.post('/:entryId/add-time', async (req, res) => {
   try {
     const { time } = req.body; // Time in minutes
     const entryId = req.params.entryId;
     const date = new Date().setHours(0, 0, 0, 0); // Start of today

     let record = await DailyEntryRecord.findOne({ entry: entryId, date });

     if (record) {
       record.totalTime += time;
     } else {
       record = new DailyEntryRecord({ entry: entryId, date, totalTime: time });
     }

     await record.save();
     res.json(record);
   } catch (error) {
     res.status(400).json({ error: error.message });
   }
 });

 // Get records for the last week
 router.get('/weekly', async (req, res) => {
   try {
     const sevenDaysAgo = new Date();
     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
     sevenDaysAgo.setHours(0, 0, 0, 0);

     const records = await DailyEntryRecord.find({ date: { $gte: sevenDaysAgo } })
       .populate('entry')
       .sort({ date: 1 });

     res.json(records);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 });

 module.exports = router;


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                Step 16: Integrate Entry Records Routes into Server

Instructions:

 1 In server.js, import the entry records routes.
 2 Use the entry records routes in the Express app.

Code Addition in server.js:


 // server.js (add after selected routine routes)

 const entryRecordsRoutes = require('./routes/entryRecords');
 app.use('/entry-records', entryRecordsRoutes);


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                              Step 17: Frontend Setup

Instructions:

 1 Navigate to the project directory and create a React app for the frontend.

Commands:


 npx create-react-app client


 2 Install necessary dependencies for making API calls and handling state.

Commands:


 cd client
 npm install axios react-router-dom


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                    Step 18: Start Building Frontend Components

Instructions:

 • Implement components for:
    • Displaying and managing entries.
    • Displaying and managing routines.
    • Displaying the start page with the selected routine and timers.
    • Displaying the overview with graphs.

Due to space constraints, we'll outline the initial structure.

File: client/src/App.js

Code:


 // src/App.js

 import React from 'react';
 import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
 import StartPage from './components/StartPage';
 import EntriesPage from './components/EntriesPage';
 import RoutinesPage from './components/RoutinesPage';
 import OverviewPage from './components/OverviewPage';
 import Navbar from './components/Navbar';

 function App() {
   return (
     <Router>
       <Navbar />
       <Switch>
         <Route exact path="/" component={StartPage} />
         <Route path="/entries" component={EntriesPage} />
         <Route path="/routines" component={RoutinesPage} />
         <Route path="/overview" component={OverviewPage} />
       </Switch>
     </Router>
   );
 }

 export default App;


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                         Step 19: Implement the Start Page

File: client/src/components/StartPage.js

Instructions:

 • Fetch the currently selected routine and display its entries.
 • Implement timers for each entry that can be started multiple times.

Note:

 • You'll need to utilize state management to handle the timers.
 • Use useState and useEffect hooks to manage component state and side effects.
 • For timers, you might create a separate Timer component.

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                    Step 20: Implement the Overview with Graphs

Instructions:

 • Install a charting library, such as Chart.js or Recharts.

Command:


 npm install recharts


File: client/src/components/OverviewPage.js

Instructions:

 • Fetch the weekly records from the backend.
 • Process the data to format it for the charts.
 • Render the charts to display the total times for each entry over the past days and weeks.

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                 Additional Steps:

 • Implement forms and components for creating, editing, and deleting entries and routines.
 • Ensure that all API requests are correctly handled using Axios.
 • Implement proper error handling and input validation on both frontend and backend.
 • Style the application using CSS or a UI library like Material-UI or Bootstrap for a better user experience.
 • Test all functionalities thoroughly to ensure everything works as expected.

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
By following these steps and gradually building out each file and component, you'll create a comprehensive application that meets all the specified requirements. Remember to commit
your changes regularly with meaningful commit messages.
