const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get default form data (public route)
router.get('/form-defaults', async (req, res) => {
  try {
    const defaults = await Settings.findOne({});
    res.json(defaults);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching form defaults' });
  }
});

// Update default form data
router.post('/form-defaults', async (req, res) => {
  const { email, organizationName, firstName, lastName, phoneNumber, individualsList, servicesList, feedbackQuestions, titleOptions, newsletterOptions } = req.body;
  try {
    let settings = await Settings.findOne({});
    if (settings) {
      settings = await Settings.findOneAndUpdate({}, {
        email,
        organizationName,
        firstName,
        lastName,
        phoneNumber,
        individualsList,
        servicesList,
        feedbackQuestions,
        titleOptions,
        newsletterOptions
      }, { new: true });
    } else {
      settings = new Settings({
        email,
        organizationName,
        firstName,
        lastName,
        phoneNumber,
        individualsList,
        servicesList,
        feedbackQuestions,
        titleOptions,
        newsletterOptions
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating form defaults' });
  }
});

module.exports = router;
