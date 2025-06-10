const User = require('../models/user.model');
const DonorProfile = require('../models/donorProfile.model');
const SeekerProfile = require('../models/seekerProfile.model');
const DoctorProfile = require('../models/doctorProfile.model');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/email');
const {hash} = require("bcrypt");

// Helper to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Helper function to normalize email addresses
// This is crucial for Gmail addresses which ignore dots in the local part
const normalizeEmail = (email) => {
  if (!email) return '';
  
  // For Gmail addresses, remove dots before @ and convert to lowercase
  if (email.includes('@gmail.com')) {
    const [localPart, domain] = email.split('@');
    return `${localPart.replace(/\./g, '')}@${domain}`.toLowerCase();
  }
  // For other emails, just convert to lowercase
  return email.toLowerCase();
};

// Step 1: Pre-registration with email and password
exports.preRegister = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Normalize the email for database lookup
    const normalizedEmail = normalizeEmail(email);
    
    // Check if user already exists using normalized email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in session or temporary storage
    req.session = req.session || {};
    req.session.preRegister = {
      email: normalizedEmail, // Store normalized email for comparisons
      originalEmail: email,   // Store original email for sending purposes
      password,
      verificationCode,
      timestamp: Date.now()
    };
    
    // Log for debugging
    console.log('PreRegister session data:', {
      normalizedEmail,
      originalEmail: email,
      verificationCode
    });
    
    // Send verification email to the original email format
    await sendVerificationEmail(email, verificationCode);
    
    res.status(200).json({
      message: 'Verification code sent to your email',
      email // Return original email to the client
    });
  } catch (error) {
    console.error('Pre-registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 2: Verify email code
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    // Normalize the received email for comparison
    const normalizedReceivedEmail = normalizeEmail(email);
    
    console.log('Verification attempt:', {
      receivedEmail: email, 
      normalizedReceivedEmail,
      sessionEmail: req.session?.preRegister?.email,
      code,
      sessionCode: req.session?.preRegister?.verificationCode
    });
    
    // Check if session exists
    if (!req.session?.preRegister) {
      return res.status(400).json({ message: 'Verification session expired or not found' });
    }
    
    // Check if normalized emails match
    if (normalizedReceivedEmail !== req.session.preRegister.email) {
      console.log('Email mismatch:', {
        original: {
          session: req.session.preRegister.originalEmail || req.session.preRegister.email,
          received: email
        },
        normalized: {
          session: req.session.preRegister.email,
          received: normalizedReceivedEmail
        }
      });
      return res.status(400).json({ message: 'Email mismatch in verification session' });
    }
    
    // Check if code is expired (10 minutes validity)
    const isCodeExpired = Date.now() - req.session.preRegister.timestamp > 10 * 60 * 1000;
    if (isCodeExpired) {
      return res.status(400).json({ message: 'Verification code expired' });
    }
    
    // Check if code matches
    if (req.session.preRegister.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Mark email as verified in session
    req.session.preRegister.emailVerified = true;
    
    // Save session explicitly 
    if (req.session.save) {
      req.session.save();
    }
    
    res.status(200).json({
      message: 'Email verified successfully',
      email: req.session.preRegister.originalEmail || email // Return original email format
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Normalize the received email
    const normalizedEmail = normalizeEmail(email);
    
    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update or create session data with normalized email
    req.session.preRegister = {
      ...(req.session.preRegister || {}),
      email: normalizedEmail,
      originalEmail: email,
      verificationCode,
      timestamp: Date.now()
    };
    
    // Log for debugging
    console.log('Resend verification session data:', {
      normalizedEmail,
      originalEmail: email,
      verificationCode
    });
    
    // Save session explicitly if method exists
    if (req.session.save) {
      req.session.save();
    }
    
    // Send verification email to original email format
    await sendVerificationEmail(email, verificationCode);
    
    res.status(200).json({
      message: 'New verification code sent to your email',
      email // Return original email to client
    });
  } catch (error) {
    console.error('Resend verification code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 3: Complete registration with user details and role
exports.completeRegistration = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      surName, 
      middleName, 
      role,
      skipEmailVerification
    } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Normalize the email
    const normalizedEmail = normalizeEmail(email);
    
    // Verify that pre-registration was completed
    // Check for skipEmailVerification flag for biometric auth
    if (!skipEmailVerification && 
        (!req.session?.preRegister?.emailVerified || 
         req.session.preRegister.email !== normalizedEmail)) {
      
      console.log('Email verification check failed:', {
        receivedEmail: email,
        normalizedReceived: normalizedEmail,
        sessionEmail: req.session?.preRegister?.email,
        emailVerified: req.session?.preRegister?.emailVerified
      });
      
      return res.status(400).json({ message: 'Please complete email verification first' });
    }
    
    // Create new user with normalized email
    const newUser = new User({
      email: normalizedEmail, // Store normalized email in database
      password: password || (req.session?.preRegister?.password || ''),
      firstName,
      surName,
      middleName,
      role
    });
    
    // Save user
    await newUser.save();
    
    // Create role-specific profile
    if (role === 'DONOR') {
      await new DonorProfile({ userId: newUser._id }).save();
    } else if (role === 'SEEKER') {
      await new SeekerProfile({ userId: newUser._id }).save();
    } else if (role === 'DOCTOR') {
      await new DoctorProfile({ userId: newUser._id }).save();
    }

    // Clear pre-registration data if it exists
    if (req.session?.preRegister) {
      delete req.session.preRegister;
    }
    const token = generateToken(newUser._id);
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        surName: newUser.surName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        surName: user.surName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginWithBiometric = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = generateToken(user._id);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        surName: user.surName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let profile = null;
    
    // Get role-specific profile
    if (user.role === 'DONOR') {
      profile = await DonorProfile.findOne({ userId: user._id });
    } else if (user.role === 'SEEKER') {
      profile = await SeekerProfile.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await DoctorProfile.findOne({ userId: user._id });
    }
    
    res.status(200).json({
      user: {
        ...user._doc,
        profile
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password if provided
    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }
    
    // Delete associated profile based on user role
    if (user.role === 'DONOR') {
      await DonorProfile.findOneAndDelete({ userId });
    } else if (user.role === 'SEEKER') {
      await SeekerProfile.findOneAndDelete({ userId });
    } else if (user.role === 'DOCTOR') {
      await DoctorProfile.findOneAndDelete({ userId });
    }

    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.forgotOrResetPassword = async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email є обовʼязковим' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'Користувача з таким email не знайдено' });
    }

    // Якщо немає verificationCode і newPassword → це запит на надсилання коду
    if (!verificationCode && !newPassword) {
      // Генеруємо новий код
      const code = generateVerificationCode();
      console.log('Verification code:', code);

      // Зберігаємо у сесію (чи будь-яке інше тимчасове сховище)
      req.session.passwordReset = {
        email: normalizedEmail,
        verificationCode: code,
        timestamp: Date.now()
      };

      // Надсилаємо код на пошту
      await sendVerificationEmail(email, code);

      return res.status(200).json({
        message: 'Код підтвердження було надіслано на вашу пошту',
        email
      });
    }

    // Якщо є і verificationCode, і newPassword → це запит на скидання пароля
    if (!verificationCode || !newPassword) {
      return res.status(400).json({ message: 'Потрібні and verificationCode, і newPassword' });
    }

    // Перевіряємо, що в сесії є запит на скидання
    const sessionData = req.session?.passwordReset;
    if (!sessionData) {
      return res.status(400).json({ message: 'Сесія скидання пароля не знайдена або закінчилася. Створіть новий запит.' });
    }

    const { email: sessionEmail, verificationCode: sessionCode, timestamp } = sessionData;

    // Порівняння email
    if (normalizedEmail !== sessionEmail) {
      return res.status(400).json({ message: 'Email не збігається з тим, що був у запиті на скидання' });
    }

    // Перевіряємо термін життя коду (15 хв)
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      delete req.session.passwordReset;
      return res.status(400).json({ message: 'Код підтвердження прострочений. Спробуйте ще раз.' });
    }

    // Перевіряємо сам код
    if (verificationCode !== sessionCode) {
      return res.status(400).json({ message: 'Невірний код підтвердження' });
    }

    // Хешуємо новий пароль і зберігаємо
    user.password = newPassword;
    await user.save();

    // Очищаємо сесію
    delete req.session.passwordReset;
    return res.status(200).json({ message: 'Пароль успішно змінено. Можете увійти.' });
  } catch (error) {
    console.error('forgotOrResetPassword error:', error);
    return res.status(500).json({ message: 'Внутрішня помилка сервера. Спробуйте пізніше.' });
  }
};