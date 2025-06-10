const mongoose = require('mongoose');

const MedicalInfoSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonorProfile',
    required: true,
    unique: true
  },
  // Forbidden conditions
  HIV_AIDS: { type: Boolean, default: false },
  hepatitisBorC: { type: Boolean, default: false },
  syphilis: { type: Boolean, default: false },
  tuberculosisActiveOrPast: { type: Boolean, default: false },
  oncologicalDiseases: { type: Boolean, default: false },
  diabetesMellitus: { type: Boolean, default: false },
  heartAndVascularDiseases: { type: Boolean, default: false },
  centralNervousSystemDiseases: { type: Boolean, default: false },
  autoimmuneDiseases: { type: Boolean, default: false },
  bloodDiseases: { type: Boolean, default: false },
  
  // Limited conditions
  hasRecentUpgade: { type: Boolean, default: false },
  upgadeDate: { type: Date },
  acuteRespiratoryInfections: { type: Boolean, default: false },
  respiratoryInfectionsDate: { type: Date },
  antibioticTherapy: { type: Boolean, default: false },
  antibioticTherapyDate: { type: Date },
  vaccination: { type: Boolean, default: false },
  vaccinationDate: { type: Date },
  surgeriesInjuriesStitches: { type: Boolean, default: false },
  surgeriesInjuriesStitchesDate: { type: Date },
  pregnancy: { type: Boolean, default: false },
  pregnancyDate: { type: Date },
  dentalPocedures: { type: Boolean, default: false },
  dentalPoceduresDate: { type: Date },
  herpesSimplex: { type: Boolean, default: false },
  herpesSimplexDate: { type: Date },
  
  // Donation info
  lastDonationDate: { type: Date },
  donationTypeOffered: {
    type: String,
    enum: ['WHOLE_BLOOD', 'PLASMA', 'PLATELETS'],
    required: true
  },
  yearlyDonationsCount: { type: Number, default: 0 }
});

const MedicalInfo = mongoose.model('MedicalInfo', MedicalInfoSchema);

module.exports = MedicalInfo;