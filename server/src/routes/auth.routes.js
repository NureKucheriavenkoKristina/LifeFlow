const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateUser } = require('../middlewares/auth');
const { validateRegistration, validateLogin, validateForgotPassword, validateResetPassword} = require('../middlewares/validation');

// Pre-registration
router.post('/pre-register', validateRegistration, authController.preRegister);

// Verify email
router.post('/verify-email', authController.verifyEmail);

router.post('/resend-verification', authController.resendVerification);

// Complete registration
router.post('/complete-registration', authController.completeRegistration);

// Login
router.post('/login', validateLogin, authController.login);
router.post('/loginWithBiometric', validateLogin, authController.loginWithBiometric);

router.post('/forgot-password', validateForgotPassword, authController.forgotOrResetPassword);


// Get current user
router.get('/me', authenticateUser, authController.getCurrentUser);

// Delete account
router.delete('/delete-account', authenticateUser, authController.deleteAccount);

module.exports = router;