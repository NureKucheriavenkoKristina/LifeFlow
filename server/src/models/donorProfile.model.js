const mongoose = require('mongoose');

const DonorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE'],
    required: false
  },
  birthDay: {
    type: Date,
    required: false
  },
  weight: {
    type: Number,
    required: false,
    min: 50
  },
  bloodType: {
    type: String,
    enum: ['I', 'II', 'III', 'IV'],
    required: false
  },
  bloodResus: {
    type: String,
    enum: ['POSITIVE', 'NEGATIVE'],
    required: false
  },
  available: {
    type: Boolean,
    default: false
  },
  hasChronicDiseases: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  consentToDataProcessing: {
    type: Boolean,
    default: false
  },
  allowProfileVisibility: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const DonorProfile = mongoose.model('DonorProfile', DonorProfileSchema);

module.exports = DonorProfile;