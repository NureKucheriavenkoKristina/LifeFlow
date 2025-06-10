const express = require('express');
const router = express.Router();
const seekerController = require('../controllers/seeker.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');
const { validateSearchRequest } = require('../middlewares/validation');

// Apply authentication middleware to all routes
router.use(authenticateUser, authorizeRole('SEEKER'));

// Get seeker profile
router.get('/profile', seekerController.getSeekerProfile);

// Search for available donors
router.get('/search-donors', seekerController.searchDonors);

// Send request to donor
router.post('/send-request', validateSearchRequest, seekerController.sendRequest);

// Get sent requests
router.get('/requests', seekerController.getSentRequests);

// Cancel request
router.delete('/cancel-request/:requestId', seekerController.cancelRequest);

module.exports = router;