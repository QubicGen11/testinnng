const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  title: { type: String},
  email: { type: String, required: true, unique: true },
  organizationName: { type: String, required: true },  // Ensure this is organizationName
  firstName: { type: String, required: true },
  lastName: { type: String},
  phoneNumber: { type: String, required: true },
  services: { type: [String], required: true },
  individuals: { type: [String], required: true },
  professionalism: { type: Map, of: Number },
  responseTime: { type: Map, of: Number },
  overallServices: { type: Map, of: Number },
  feedback: { type: String, required: true },
  recommend: { type: String, required: true },
  subscribeNewsletter: { type: String },
  termsAccepted: { type: Boolean, required: true },
  customResponses: { type: Map, of: Number }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
