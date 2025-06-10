const { body, validationResult } = require('express-validator');

// Validation error handling
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registration validation
exports.validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
  handleValidationErrors
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Donor profile validation
exports.validateDonorProfile = [
  body('gender')
    .isIn(['MALE', 'FEMALE'])
    .withMessage('Gender must be either MALE or FEMALE'),
  body('birthDay')
    .isDate()
    .withMessage('Please provide a valid date')
    .custom(value => {
      const age = (new Date() - new Date(value)) / (1000 * 60 * 60 * 24 * 365);
      return age >= 18 && age <= 60;
    })
    .withMessage('Donor must be between 18 and 60 years old'),
  body('weight')
    .isNumeric()
    .withMessage('Weight must be a number')
    .custom(value => value >= 50)
    .withMessage('Weight must be at least 50kg'),
  body('bloodType')
    .isIn(['I', 'II', 'III', 'IV'])
    .withMessage('Invalid blood type'),
  body('bloodResus')
    .isIn(['POSITIVE', 'NEGATIVE'])
    .withMessage('Blood resus must be either POSITIVE or NEGATIVE'),
  body('consentToDataProcessing')
    .isBoolean()
    .withMessage('Consent must be a boolean value'),
  handleValidationErrors
];

// Medical info validation
exports.validateMedicalInfo = [
  // Only validate required fields, others are optional
  body('donationTypeOffered')
    .isIn(['WHOLE_BLOOD', 'PLASMA', 'PLATELETS'])
    .withMessage('Invalid donation type'),
  // Add validation for dates if they are provided
  body('upgadeDate')
    .optional()
    .isDate()
    .withMessage('Please provide a valid date'),
  body('respiratoryInfectionsDate')
    .optional()
    .isDate()
    .withMessage('Please provide a valid date'),
  // Add more validations as needed
  handleValidationErrors
];

// Search request validation
exports.validateSearchRequest = [
  body('donorId')
    .notEmpty()
    .withMessage('Donor ID is required'),
  handleValidationErrors
];

// Message validation
exports.validateMessage = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 1000 })
    .withMessage('Message too long (max 1000 characters)'),
  handleValidationErrors
];

exports.validateForgotPassword = [
  body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email'),
  handleValidationErrors
];

exports.validateResetPassword = [
  body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email'),
  body('verificationCode')
      .notEmpty()
      .withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be 6 digits')
      .isNumeric()
      .withMessage('Verification code must contain only numbers'),
  body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter'),
  handleValidationErrors
];