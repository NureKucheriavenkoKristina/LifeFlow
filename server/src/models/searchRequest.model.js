const mongoose = require('mongoose');

const SearchRequestSchema = new mongoose.Schema({
  seekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeekerProfile',
    required: true
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonorProfile',
    required: true
  },
  // Add these fields to store search criteria
  bloodType: {
    type: String,
    default: 'Any'
  },
  resusFactor: {
    type: String,
    default: 'Any'
  },
  donationType: {
    type: String,
    default: 'Whole Blood'
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  },
  meetingLink: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SearchRequest = mongoose.model('SearchRequest', SearchRequestSchema);

module.exports = SearchRequest;