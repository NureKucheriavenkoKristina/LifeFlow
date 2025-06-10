const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateUser } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Search users
router.get('/search', userController.searchUsers);

module.exports = router;