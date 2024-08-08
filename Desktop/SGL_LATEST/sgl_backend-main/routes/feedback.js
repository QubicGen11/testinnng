const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Middleware for logging requests
router.use((req, res, next) => {
  console.log(`Request received at ${new Date().toISOString()}`);
  next();
});

// Create feedback and send email to both admin and user
router.post('/', async (req, res) => {
  try {
    console.log('Received feedback data:', req.body); // Log the received data for debugging
    const feedback = new Feedback(req.body);
    await feedback.save();

    // Set up the nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email options for the receiver (admin)
    let receiverMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'sanjusazid0@gmail.com',
      subject: 'Received New Feedback',
      text: ` 
        Greetings,

        Received new feedback from client ${feedback.email}.
        Thanks.

        The details are:
        ${feedback.firstName} ${feedback.lastName}
        ${feedback.email}
      `
    };

    // Email options for the sender (person who submitted the feedback)
    let senderMailOptions = {
      from: process.env.EMAIL_USER,
      to: feedback.email,
      subject: 'Thank you for your feedback',
      text: `Dear ${feedback.firstName},

      Thank you for submitting your feedback.

      Best regards,
      Somireddy Law Group PLLC`
    };

    // Send both emails
    await transporter.sendMail(receiverMailOptions);
    await transporter.sendMail(senderMailOptions);

    res.status(201).send(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(400).send({ error: error.message });
  }
});

// Get all feedback or by email or by name
router.get('/', async (req, res) => {
  try {
    const { email, name } = req.query;
    let feedbacks;
    if (email) {
      feedbacks = await Feedback.findOne({ email: email });
    } else if (name) {
      const regex = new RegExp(name.split(' ').join('|'), 'i');
      feedbacks = await Feedback.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { fullName: regex }
        ]
      });
    } else {
      feedbacks = await Feedback.find();
    }
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update feedback by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete feedback by ID
router.delete('/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send email when form is opened
router.post('/notify-open', async (req, res) => {
  try {
    console.log('Received form open notification:', req.body);
    
    // Get feedback data from request
    const { firstName, lastName, formUrl } = req.body;

    // Set up the nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Load the HTML template and replace placeholders
    const htmlTemplate = fs.readFileSync(path.join(__dirname, '../templates/feedback-email.html'), 'utf-8');
    const htmlContent = htmlTemplate
      .replace('{{firstName}}', firstName)
      .replace('{{lastName}}', lastName)
      .replace('{{formUrl}}', formUrl);

    // Mail options
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'sanjusazid0@gmail.com', // Send to your email
      subject: 'Feedback Form',
      html: htmlContent,
 
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
