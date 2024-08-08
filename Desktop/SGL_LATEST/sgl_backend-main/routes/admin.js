const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const Settings = require('../models/Settings'); // Import the Settings model

const adminEmail = 'admin@gmail.com';
let adminPassword = bcrypt.hashSync('admin', 10); // Mutable for change password

// Admin login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Received login request:', { email, password });

  if (email === adminEmail && bcrypt.compareSync(password, adminPassword)) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful, token generated');
    res.json({ success: true, token });
  } else {
    console.log('Login failed, invalid email or password');
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

// Change password route
router.post('/change-password', authenticateJWT, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { email } = req.user;

  console.log('Change password request received:', { currentPassword, newPassword });

  if (!currentPassword || !newPassword) {
    console.log('Current password or new password is missing');
    return res.status(400).json({ success: false, message: 'Current password and new password are required' });
  }

  if (email === adminEmail) {
    console.log('Comparing passwords');
    if (bcrypt.compareSync(currentPassword, adminPassword)) {
      console.log('Current password is correct');
      adminPassword = bcrypt.hashSync(newPassword, 10);
      res.json({ success: true, message: 'Password changed successfully' });
    } else {
      console.log('Current password is incorrect');
      res.status(401).json({ success: false, message: 'Invalid current password' });
    }
  } else {
    console.log('Unauthorized user');
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

// Protected route example
router.get('/protected-route', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// Get default form data
router.get('/form-defaults', async (req, res) => {
  try {
    const defaults = await Settings.findOne({});
    res.json(defaults);
  } catch (error) {
    console.error('Error fetching form defaults:', error);
    res.status(500).json({ message: 'Error fetching form defaults' });
  }
});

// Update default form data
router.post('/form-defaults', async (req, res) => {
  const {
    title,
    email,
    companyEmail,
    companyName,
    companyPhoneNumber,
    organizationName,
    firstName,
    lastName,
    phoneNumber,
    services,
    individuals,
    feedback,
    recommend,
    subscribeNewsletter,
    termsAccepted,
    customResponses
  } = req.body;

  try {
    if (!feedback || !recommend || subscribeNewsletter === undefined || termsAccepted === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let settings = await Settings.findOne({});
    if (settings) {
      settings = await Settings.findOneAndUpdate(
        {},
        {
          title,
          email,
          companyEmail,
          companyName,
          companyPhoneNumber,
          organizationName,
          firstName,
          lastName,
          phoneNumber,
          services,
          individuals,
          feedback,
          recommend,
          subscribeNewsletter,
          termsAccepted,
          customResponses
        },
        { new: true }
      );
    } else {
      settings = new Settings({
        title,
        email,
        companyEmail,
        companyName,
        companyPhoneNumber,
        organizationName,
        firstName,
        lastName,
        phoneNumber,
        services,
        individuals,
        feedback,
        recommend,
        subscribeNewsletter,
        termsAccepted,
        customResponses
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Error updating form defaults:', error);
    res.status(500).json({ message: 'Error updating form defaults' });
  }
});


// Custom Questions Routes

// Get custom questions
router.get('/custom-questions', authenticateJWT, async (req, res) => {
  try {
    const settings = await Settings.findOne({});
    res.json(settings ? settings.feedbackQuestions : []);
  } catch (error) {
    console.error('Error fetching custom questions:', error);
    res.status(500).json({ message: 'Error fetching custom questions' });
  }
});

// Add a custom question
router.post('/custom-questions', authenticateJWT, async (req, res) => {
  const { question } = req.body;
  try {
    let settings = await Settings.findOne({});
    if (settings) {
      settings.feedbackQuestions.push(question);
      await settings.save();
    } else {
      settings = new Settings({ feedbackQuestions: [question] });
      await settings.save();
    }
    res.json(settings.feedbackQuestions);
  } catch (error) {
    console.error('Error adding custom question:', error);
    res.status(500).json({ message: 'Error adding custom question' });
  }
});

// Update a custom question
router.put('/custom-questions/:index', authenticateJWT, async (req, res) => {
  const { index } = req.params;
  const { question } = req.body;
  try {
    let settings = await Settings.findOne({});
    if (settings && settings.feedbackQuestions[index]) {
      settings.feedbackQuestions[index] = question;
      await settings.save();
      res.json(settings.feedbackQuestions);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    console.error('Error updating custom question:', error);
    res.status(500).json({ message: 'Error updating custom question' });
  }
});

// Delete a custom question
router.delete('/custom-questions/:index', authenticateJWT, async (req, res) => {
  const { index } = req.params;
  try {
    let settings = await Settings.findOne({});
    if (settings && settings.feedbackQuestions[index]) {
      settings.feedbackQuestions.splice(index, 1);
      await settings.save();
      res.json(settings.feedbackQuestions);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    console.error('Error deleting custom question:', error);
    res.status(500).json({ message: 'Error deleting custom question' });
  }
});

module.exports = router;
