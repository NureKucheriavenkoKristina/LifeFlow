const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');
const { validateDonorProfile, validateMedicalInfo } = require('../middlewares/validation');

// Apply authentication middleware to all routes
router.use(authenticateUser, authorizeRole('DONOR'));

// Get donor profile
router.get('/profile', donorController.getDonorProfile);

// Update donor profile
router.put('/profile', validateDonorProfile, donorController.updateDonorProfile);

// Submit medical questionnaire
router.post('/medical-info', validateMedicalInfo, donorController.submitMedicalQuestionnaire);

// Get donation history
router.get('/donation-history', donorController.getDonationHistory);

// Get next donation date
router.get('/next-donation-date', donorController.getNextDonationDate);

// Get search requests
router.get('/requests', donorController.getSearchRequests);

// Respond to search request
router.post('/respond-to-request', donorController.respondToSearchRequest);

module.exports = router;