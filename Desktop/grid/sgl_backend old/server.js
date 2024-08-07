const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const feedbackRoutes = require('./routes/feedback');
const mailRoutes = require('./routes/mail');
const adminRoutes = require('./routes/admin');
const Feedback = require('./models/Feedback'); // Import the Feedback model


const app = express();

const allowedOrigins = ['https://sgl.vercel.app', 'http://localhost:5173', 'https://sglbk.vercel.app', 'http://localhost:8081'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.json());

// Middleware to log requests for debugging
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Handle preflight requests
app.options('*', cors(corsOptions));

// Mount routes
app.use('/api', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes); // Make sure this line is present
app.use('/api/mail', mailRoutes);

// In-memory lists (these should ideally be stored in a database)
let individualsList = [];
let servicesList = [];

app.get('/api/lists', (req, res) => {
  console.log('Fetching individuals and services lists');
  res.json({ individualsList, servicesList });
});

app.post('/api/lists/individuals', (req, res) => {
  const { updatedList } = req.body;
  console.log('Updating individuals list:', updatedList);
  individualsList = updatedList;
  res.json({ success: true });
});

app.post('/api/lists/services', (req, res) => {
  const { updatedList } = req.body;
  console.log('Updating services list:', updatedList);
  servicesList = updatedList;
  res.json({ success: true });
});

app.get('/api/feedback/suggestions', async (req, res) => {
  const { email, name, organizationName } = req.query;
  try {
    let suggestions;
    if (email) {
      suggestions = await Feedback.find({ email: new RegExp(email, 'i') }).select('email');
      res.json(suggestions.map(s => s.email));
    } else if (name) {
      const regex = new RegExp(name.split(' ').join('|'), 'i');
      suggestions = await Feedback.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { fullName: { $regex: regex } }
        ]
      }).select('firstName lastName');
      res.json(suggestions.map(s => `${s.firstName} ${s.lastName}`));
    } else if (organizationName) {
      suggestions = await Feedback.find({ organizationName: new RegExp(organizationName, 'i') }).select('organizationName');
      res.json(suggestions.map(s => s.organizationName));
    } else {
      return res.status(400).json({ message: 'Bad Request: email, name, or organizationName query parameter is required' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
});

app.get('/api/feedback/date-range', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    console.log(`Fetching feedback from ${startDate} to ${endDate}`);
    if (!startDate || !endDate) {
      return res.status(400).send('Start date and end date query parameters are required');
    }
    const feedbacks = await Feedback.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback within date range:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

// Default routes
app.get('/test', (req, res) => {
  res.send('Hello World!');
});

app.get('/', (req, res) => {
  res.send('API is working fine.');
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
