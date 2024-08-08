const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  title: { type: String },
  email: { type: String, unique: true },
  companyEmail: { type: String }, 
  companyName: { type: String }, 
  companyPhoneNumber: { type: String }, 
  organizationName: { type: String }, 
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  services: { type: [String] },
  individuals: { type: [String] },
  professionalism: { type: Map, of: Number },
  responseTime: { type: Map, of: Number },
  overallServices: { type: Map, of: Number },
  feedbacks: { type: Map, of: String },
  recommend: { type: String, required: true },
  subscribeNewsletter: { type: Boolean, required: true },  // Changed to Boolean
  termsAccepted: { type: Boolean, required: true },
  customResponses: { type: Map, of: Number }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
