const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
}, { timestamps: true });

const DoctorProfile = mongoose.model('DoctorProfile', DoctorProfileSchema);

module.exports = DoctorProfile;