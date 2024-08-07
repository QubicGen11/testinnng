const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  title: { type: String},
  email: { type: String, unique: true },
  organizationName: { type: String },  // Ensure this is organizationName
  firstName: { type: String },
  lastName: { type: String},
  phoneNumber: { type: String },
  services: { type: [String] },
  individuals: { type: [String] },
  professionalism: { type: Map, of: Number },
  responseTime: { type: Map, of: Number },
  overallServices: { type: Map, of: Number },
  feedback: { type: String },
  recommend: { type: String },
  subscribeNewsletter: { type: String },
  termsAccepted: { type: Boolean },
  customResponses: { type: Map, of: Number }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
