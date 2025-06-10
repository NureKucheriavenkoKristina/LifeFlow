const DoctorProfile = require('../models/doctorProfile.model');
const DonorProfile = require('../models/donorProfile.model');
const SeekerProfile = require('../models/seekerProfile.model');
const User = require('../models/user.model');
const MedicalInfo = require('../models/medicalInfo.model');
const DonationRecord = require('../models/donationRecord.model');
const SearchRequest = require('../models/searchRequest.model');

// Get all pending verifications
exports.getPendingVerifications = async (req, res) => {
  try {
    // Find all donor profiles with pending verification
    const pendingDonors = await DonorProfile.find({
      verificationStatus: 'PENDING'
    })
    .populate({
      path: 'userId',
      select: 'firstName surName email createdAt'
    });
    
    // Get medical info for each donor
    const donorsWithInfo = await Promise.all(
      pendingDonors.map(async (donor) => {
        const medicalInfo = await MedicalInfo.findOne({ donorId: donor._id });
        return {
          ...donor._doc,
          medicalInfo
        };
      })
    );
    
    res.status(200).json({
      pendingVerifications: donorsWithInfo
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Review donor verification
exports.reviewDonorVerification = async (req, res) => {
  try {
    const { donorId, decision, feedback } = req.body;
    
    // Find the donor profile
    const donorProfile = await DonorProfile.findById(donorId);
    
    if (!donorProfile) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }
    
    // Update verification status
    if (decision === 'approve') {
      donorProfile.verificationStatus = 'APPROVED';
    } else if (decision === 'reject') {
      donorProfile.verificationStatus = 'REJECTED';
    } else {
      return res.status(400).json({ message: 'Invalid decision' });
    }
    
    // Save changes
    await donorProfile.save();
    
    // Send email notification to donor (in real implementation)
    
    res.status(200).json({
      message: `Donor verification ${decision === 'approve' ? 'approved' : 'rejected'}`,
      donorProfile
    });
  } catch (error) {
    console.error('Review donor verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Record donation
exports.recordDonation = async (req, res) => {
  try {
    const { donorId, donationType } = req.body;
    
    // Find donor profile
    const donorProfile = await DonorProfile.findById(donorId);
    
    if (!donorProfile) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }
    
    // Get medical info
    const medicalInfo = await MedicalInfo.findOne({ donorId });
    
    if (!medicalInfo) {
      return res.status(404).json({ message: 'Medical info not found' });
    }
    
    // Get existing donation records
    const existingRecords = await DonationRecord.find({ donorId });
    
    // Create new donation record
    const newDonation = new DonationRecord({
      donorId,
      donationType,
      numberOfDonation: existingRecords.length + 1
    });
    
    // Update medical info
    medicalInfo.lastDonationDate = new Date();
    medicalInfo.yearlyDonationsCount += 1;
    
    // Save changes
    await newDonation.save();
    await medicalInfo.save();
    
    res.status(201).json({
      message: 'Donation recorded successfully',
      donation: newDonation
    });
  } catch (error) {
    console.error('Record donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get donation statistics
exports.getDonationStatistics = async (req, res) => {
  try {
    // Get total users count by role
    const userCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Get total donations by type
    const donationCounts = await DonationRecord.aggregate([
      { $group: { _id: '$donationType', count: { $sum: 1 } } }
    ]);
    
    // Get monthly donations
    const monthlyDonations = await DonationRecord.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.status(200).json({
      userCounts,
      donationCounts,
      monthlyDonations
    });
  } catch (error) {
    console.error('Get donation statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get donor details for admin/doctor view
exports.getDonorDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find donor profile
    const donorProfile = await DonorProfile.findOne({ userId: userId });
    
    if (!donorProfile) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }
    
    // Get medical info
    const medicalInfo = await MedicalInfo.findOne({ donorId: donorProfile._id });
    
    res.status(200).json({
      user,
      donorProfile,
      medicalInfo
    });
  } catch (error) {
    console.error('Get donor details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get seeker details for admin/doctor view
exports.getSeekerDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find seeker profile
    const seekerProfile = await SeekerProfile.findOne({ userId: userId });
    
    if (!seekerProfile) {
      return res.status(404).json({ message: 'Seeker profile not found' });
    }
    
    // Get donation count (requests that were accepted)
    const donationCount = await SearchRequest.countDocuments({
      seekerId: seekerProfile._id,
      status: 'ACCEPTED'
    });
    
    res.status(200).json({
      user,
      seekerProfile,
      donationCount
    });
  } catch (error) {
    console.error('Get seeker details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get doctor details for admin view
exports.getDoctorDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find doctor profile
    const doctorProfile = await DoctorProfile.findOne({ userId: userId });
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    res.status(200).json({
      user,
      doctorProfile
    });
  } catch (error) {
    console.error('Get doctor details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all donations for admin/doctor view
exports.getAllDonations = async (req, res) => {
  try {
    // Find all donation records
    const donations = await DonationRecord.find()
      .sort({ date: -1 })
      .populate({
        path: 'donorId',
        populate: {
          path: 'userId',
          select: 'firstName surName role'
        }
      });
    
    // Format donations with additional info
    const formattedDonations = await Promise.all(
      donations.map(async (donation) => {
        // Extract donor info
        const donor = donation.donorId?.userId || null;
        const donorProfile = donation.donorId || null;
        
        // Find if there was a seeker associated with this donation
        // (Based on search requests that were accepted)
        let seeker = null;
        let seekerProfile = null;
        
        const searchRequest = await SearchRequest.findOne({
          donorId: donation.donorId,
          status: 'ACCEPTED',
          createdAt: { $lte: donation.date } // Request was before the donation
        }).sort({ createdAt: -1 }) // Get the most recent one
        .populate({
          path: 'seekerId',
          populate: {
            path: 'userId',
            select: 'firstName surName role'
          }
        });
        
        if (searchRequest) {
          seeker = searchRequest.seekerId?.userId || null;
          seekerProfile = searchRequest.seekerId || null;
        }
        
        return {
          ...donation._doc,
          donor,
          donorProfile,
          seeker,
          seekerProfile
        };
      })
    );
    
    res.status(200).json({
      donations: formattedDonations
    });
  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchDonors = async (req, res) => {
  const search = req.query.search;
  try {
    const query = {
      verificationStatus: 'APPROVED'
    };

    let donorsQuery = DonorProfile.find(query)
        .populate({
          path: 'userId',
          select: 'firstName surName email'
        });

    if (search) {
      donorsQuery = DonorProfile.find(query)
          .populate({
            path: 'userId',
            select: 'firstName surName email',
            match: {
              $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { surName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
              ]
            }
          });
    }

    const donors = await donorsQuery;

    const filteredDonors = search
        ? donors.filter(donor => donor.userId !== null)
        : donors;

    res.status(200).json({ donors: filteredDonors });
  } catch (error) {
    console.error('Error searching donors:', error);
    res.status(500).json({ message: 'Server error while searching donors' });
  }
};
