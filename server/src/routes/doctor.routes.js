const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser, authorizeRole('DOCTOR'));

// Get all pending verifications
router.get('/pending-verifications', doctorController.getPendingVerifications);
router.get('/donors', doctorController.searchDonors);

// Review donor verification
router.post('/review-verification', doctorController.reviewDonorVerification);

// Record donation
router.post('/record-donation', doctorController.recordDonation);

// Get donation statistics
router.get('/statistics', doctorController.getDonationStatistics);

//
router.get('/admin/users/:userId/donor-details', doctorController.getDonorDetails);

//
router.get('/admin/users/:userId/seeker-details', doctorController.getSeekerDetails);

//
router.get('/admin/users/:userId/doctor-details', doctorController.getDoctorDetails);

//
router.get('/admin/donations', doctorController.getAllDonations);

module.exports = router;