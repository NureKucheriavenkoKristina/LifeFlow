const mongoose = require('mongoose');

const DonationRecordSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonorProfile',
    required: true
  },
  donationType: {
    type: String,
    enum: ['WHOLE_BLOOD', 'PLASMA', 'PLATELETS'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  numberOfDonation: {
    type: Number,
    required: true
  }
});

const DonationRecord = mongoose.model('DonationRecord', DonationRecordSchema);

module.exports = DonationRecord;