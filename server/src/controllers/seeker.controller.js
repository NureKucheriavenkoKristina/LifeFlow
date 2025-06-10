const SeekerProfile = require('../models/seekerProfile.model');
const DonorProfile = require('../models/donorProfile.model');
const User = require('../models/user.model');
const SearchRequest = require('../models/searchRequest.model');
const MedicalInfo = require('../models/medicalInfo.model');
const DonationRecord = require('../models/donationRecord.model'); // Додаємо імпорт
const { sendRequestNotificationEmail } = require('../utils/email');

// Get seeker profile
exports.getSeekerProfile = async (req, res) => {
  try {
    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({ message: 'Seeker profile not found' });
    }

    res.status(200).json({
      seekerProfile
    });
  } catch (error) {
    console.error('Get seeker profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send request to donor
exports.sendRequest = async (req, res) => {
  try {
    const { donorId } = req.body;

    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({ message: 'Seeker profile not found' });
    }

    // Check if donor exists and is available
    const donorProfile = await DonorProfile.findOne({
      _id: donorId,
      allowProfileVisibility: true,
      verificationStatus: 'APPROVED'
    });

    if (!donorProfile) {
      return res.status(404).json({ message: 'Donor not found or not available' });
    }

    // Check if request already exists
    const existingRequest = await SearchRequest.findOne({
      seekerId: seekerProfile._id,
      donorId,
      status: { $in: ['PENDING', 'ACCEPTED'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'You already have a pending or accepted request to this donor'
      });
    }

    // Create new request
    const newRequest = new SearchRequest({
      seekerId: seekerProfile._id,
      donorId
    });

    await newRequest.save();

    // Get donor user for email notification
    const donorUser = await User.findById(donorProfile.userId);

    // Send email notification to donor
    await sendRequestNotificationEmail(
        donorUser.email,
        `${req.user.firstName} ${req.user.surName}`
    );

    res.status(201).json({
      message: 'Request sent successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sent requests
exports.getSentRequests = async (req, res) => {
  try {
    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({ message: 'Seeker profile not found' });
    }

    // Get search requests
    const searchRequests = await SearchRequest.find({
      seekerId: seekerProfile._id
    })
        .populate({
          path: 'donorId',
          select: 'bloodType bloodResus',
          populate: {
            path: 'userId',
            select: 'firstName surName'
          }
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
      requests: searchRequests
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel request
exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({ message: 'Seeker profile not found' });
    }

    // Find the request
    const request = await SearchRequest.findOne({
      _id: requestId,
      seekerId: seekerProfile._id,
      status: 'PENDING'
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    // Update status
    request.status = 'CANCELLED';
    await request.save();

    res.status(200).json({
      message: 'Request cancelled successfully',
      request
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchDonors = async (req, res) => {
  try {
    const { bloodType, bloodResus, donationType } = req.query;

    console.log('Search params received:', { bloodType, bloodResus, donationType });

    const today = new Date();

    // Базовий запит - НЕ включаємо available: true в базовий запит
    const baseQuery = {
      verificationStatus: 'APPROVED',
      allowProfileVisibility: true
    };

    // Додаємо фільтри крові тільки якщо вони передані
    if (bloodType && bloodType !== '') {
      baseQuery.bloodType = bloodType;
    }

    if (bloodResus && bloodResus !== '') {
      baseQuery.bloodResus = bloodResus;
    }

    console.log('Base query:', baseQuery);

    const donors = await DonorProfile.find(baseQuery)
        .populate({
          path: 'userId',
          select: 'firstName surName'
        });

    console.log(`Found ${donors.length} donors matching base criteria`);

    const filteredDonors = [];

    for (const donor of donors) {
      try {
        // Отримуємо медичну інформацію
        const medicalInfo = await MedicalInfo.findOne({ donorId: donor._id });

        console.log(`Processing donor: ${donor.userId?.firstName} ${donor.userId?.surName}`);
        console.log(`Medical info exists: ${!!medicalInfo}`);
        console.log(`Donor available flag: ${donor.available}`);

        // Перевіряємо доступність донора для донації
        let canDonateToday = true;
        let nextDonationDate = new Date();

        // Якщо є медична інформація, перевіряємо обмеження
        if (medicalInfo) {
          // Перевіряємо останню донацію з lastDonationDate в MedicalInfo або DonationRecord
          let lastDonation = null;
          let lastDonationDate = null;

          // Спочатку перевіряємо lastDonationDate в MedicalInfo
          if (medicalInfo.lastDonationDate) {
            lastDonationDate = new Date(medicalInfo.lastDonationDate);
            console.log(`Last donation from MedicalInfo: ${lastDonationDate}`);
          } else {
            // Якщо немає в MedicalInfo, шукаємо в DonationRecord
            lastDonation = await DonationRecord.findOne({
              donorId: donor._id
            }).sort({ date: -1 });

            if (lastDonation) {
              lastDonationDate = new Date(lastDonation.date);
              console.log(`Last donation from DonationRecord: ${lastDonationDate}`);
            }
          }

          if (lastDonationDate) {
            const daysSinceLastDonation = Math.floor((today - lastDonationDate) / (1000 * 60 * 60 * 24));
            console.log(`Days since last donation: ${daysSinceLastDonation}`);

            // Перевіряємо період відновлення залежно від типу донації
            let requiredRecoveryDays = 0;
            const donationTypeToCheck = lastDonation?.donationType || medicalInfo.donationTypeOffered;

            if (donationTypeToCheck === 'WHOLE_BLOOD') {
              requiredRecoveryDays = 60;
            } else if (donationTypeToCheck === 'PLASMA' || donationTypeToCheck === 'PLATELETS') {
              requiredRecoveryDays = 14;
            }

            if (daysSinceLastDonation < requiredRecoveryDays) {
              canDonateToday = false;
              nextDonationDate = new Date(lastDonationDate);
              nextDonationDate.setDate(nextDonationDate.getDate() + requiredRecoveryDays);
              console.log(`Donor not available due to recovery period. Next date: ${nextDonationDate}`);
            }
          }

          // Перевіряємо медичні обмеження
          if (canDonateToday) {
            const medicalRestrictions = [];

            // Tattoo, piercing, etc. (5 months)
            if (medicalInfo.hasRecentUpgade && medicalInfo.upgadeDate) {
              const restrictionDate = new Date(medicalInfo.upgadeDate);
              restrictionDate.setMonth(restrictionDate.getMonth() + 5);
              if (restrictionDate > today) {
                medicalRestrictions.push({ type: 'hasRecentUpgade', date: restrictionDate });
              }
            }

            // Respiratory infections (1 month)
            if (medicalInfo.acuteRespiratoryInfections && medicalInfo.respiratoryInfectionsDate) {
              const restrictionDate = new Date(medicalInfo.respiratoryInfectionsDate);
              restrictionDate.setMonth(restrictionDate.getMonth() + 1);
              if (restrictionDate > today) {
                medicalRestrictions.push({ type: 'acuteRespiratoryInfections', date: restrictionDate });
              }
            }

            // Antibiotic therapy (2 weeks)
            if (medicalInfo.antibioticTherapy && medicalInfo.antibioticTherapyDate) {
              const restrictionDate = new Date(medicalInfo.antibioticTherapyDate);
              restrictionDate.setDate(restrictionDate.getDate() + 14);
              if (restrictionDate > today) {
                medicalRestrictions.push({ type: 'antibioticTherapy', date: restrictionDate });
              }
            }

            // Vaccination (1 month)
            if (medicalInfo.vaccination && medicalInfo.vaccinationDate) {
              const restrictionDate = new Date(medicalInfo.vaccinationDate);
              restrictionDate.setMonth(restrictionDate.getMonth() + 1);
              if (restrictionDate > today) {
                medicalRestrictions.push({ type: 'vaccination', date: restrictionDate });
              }
            }

            // Surgeries, injuries, stitches (6 months)
            if (medicalInfo.surgeriesInjuriesStitches && medicalInfo.surgeriesInjuriesStitchesDate) {
              const restrictionDate = new Date(medicalInfo.surgeriesInjuriesStitchesDate);
              restrictionDate.setMonth(restrictionDate.getMonth() + 6);
              if (restrictionDate > today) {
                medicalRestrictions.push({ type: 'surgeriesInjuriesStitches', date: restrictionDate });
              }
            }

            // Pregnancy (1 year)
            if (medicalInfo.pregnancy && medicalInfo.pregnancyDate) {
              const restrictionDate = new Date(medicalInfo.pregnancyDate);
              restrictionDate.setFullYear(restrictionDate.getFullYear() + 1);
              if (restrictionDate > today) {
                medicalRestrictions.push({ type: 'pregnancy', date: restrictionDate });
              }
            }

            // Dental procedures (1 month)
            if (medicalInfo.dentalPocedures && medicalInfo.dentalPoceduresDate) {
              const restrictionDate = new Date(medicalInfo.dentalPoceduresDate);
              restrictionDate.setMonth(restrictionDate.getMonth() + 1);
              if (restrictionDate > today) {
                medicalRestrictions.push({ type: 'dentalPocedures', date: restrictionDate });
              }
            }

            // Herpes simplex (2 weeks)
            if (medicalInfo.herpesSimplex && medicalInfo.herpesSimplexDate) {
              const restrictionDate = new Date(medicalInfo.herpesSimplexDate);
              restrictionDate.setDate(restrictionDate.getDate() + 14);
              if (restrictionDate > today) {
                medicalRestrictions.push({ type: 'herpesSimplex', date: restrictionDate });
              }
            }

            // Якщо є активні обмеження, донор недоступний
            if (medicalRestrictions.length > 0) {
              canDonateToday = false;
              console.log(`Donor has active medical restrictions:`, medicalRestrictions);
            }
          }
        }

        // Також перевіряємо флаг available в профілі донора
        // Донор доступний, якщо може донувати сьогодні ТА available = true
        const isDonorAvailable = canDonateToday;

        console.log(`Can donate today: ${canDonateToday}, Available flag: ${donor.available}, Final available: ${isDonorAvailable}`);

        // Якщо донор доступний, додаємо до результатів
        if (isDonorAvailable) {
          // Перевіряємо тип донації, якщо він вказаний
          let donationTypeMatches = true;
          if (donationType && donationType !== '' && medicalInfo) {
            donationTypeMatches = medicalInfo.donationTypeOffered === donationType;
            console.log(`Donation type filter: requested=${donationType}, offered=${medicalInfo.donationTypeOffered}, matches=${donationTypeMatches}`);
          }

          if (donationTypeMatches) {
            filteredDonors.push({
              donor,
              donationTypeOffered: medicalInfo?.donationTypeOffered || null
            });
            console.log(`Added donor: ${donor.userId?.firstName} ${donor.userId?.surName}`);
          }
        }

      } catch (donorError) {
        console.error(`Error processing donor ${donor._id}:`, donorError);
        // Продовжуємо обробку інших донорів
      }
    }

    console.log(`Final filtered donors count: ${filteredDonors.length}`);

    res.status(200).json({
      donors: filteredDonors.map(item => ({
        id: item.donor._id,
        firstName: item.donor.userId?.firstName || 'Unknown',
        surName: item.donor.userId?.surName || 'Unknown',
        bloodType: item.donor.bloodType,
        bloodResus: item.donor.bloodResus,
        donationTypeOffered: item.donationTypeOffered
      }))
    });
  } catch (error) {
    console.error('Search donors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};