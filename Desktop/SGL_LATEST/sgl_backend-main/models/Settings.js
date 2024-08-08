const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  title: { type: String },
  email: { type: String },
  companyEmail: { type: String }, 
  companyName: { type: String }, 
  companyPhoneNumber: { type: String }, 
  organizationName: { type: String, required: true }, 
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  services: { type: [String] },
  individuals: { type: [String], required: true },
  professionalism: { type: Map, of: Number },
  responseTime: { type: Map, of: Number },
  overallServices: { type: Map, of: Number },
  feedback: { type: String, required: true },
  recommend: { type: String, required: true },
  subscribeNewsletter: { type: Boolean, required: true },  // Changed to Boolean
  termsAccepted: { type: Boolean, required: true },
  customResponses: { type: Map, of: String },
  feedbackQuestions: { type: [String], default: [] },
  titleOptions: { type: [String], default: [] },
  newsletterOptions: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
