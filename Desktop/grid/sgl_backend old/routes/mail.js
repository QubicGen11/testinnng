const express = require('express');
const Feedback = require('../models/Feedback');
const nodemailer = require('nodemailer');

const router = express.Router();

router.post('/', async (req, res) => {
  const newFeedback = new Feedback(req.body);

  try {
    const savedFeedback = await newFeedback.save();

    // Send confirmation email
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // let mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: 'sanjusazid41@gmail.com',
    //   subject: 'New Feedback Submitted',
    //   text: `A new feedback has been submitted by ${savedFeedback.email}`
    // };

    await transporter.sendMail(mailOptions);

    res.status(201).json(savedFeedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
