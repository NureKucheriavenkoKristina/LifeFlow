const mongoose = require('mongoose');

const SeekerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  }
}, { timestamps: true });

const SeekerProfile = mongoose.model('SeekerProfile', SeekerProfileSchema);

module.exports = SeekerProfile;