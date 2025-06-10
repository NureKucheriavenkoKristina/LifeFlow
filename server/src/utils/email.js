const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();
console.log('Initializing email service...');
console.log('Email host:', process.env.EMAIL_HOST);
console.log('Email port:', process.env.EMAIL_PORT);


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



exports.sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Blood Donation Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #d32f2f; text-align: center;">Blood Donation Platform</h2>
          <p>Thank you for registering with our Blood Donation Platform. Please verify your email address by entering the following code:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">${code}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <p>Best regards,<br>Blood Donation Platform Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};


exports.sendRequestNotificationEmail = async (donorEmail, seekerName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: donorEmail,
      subject: 'New Donation Request - Blood Donation Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #d32f2f; text-align: center;">Blood Donation Platform</h2>
          <p>Hello,</p>
          <p>You have received a new donation request from ${seekerName}.</p>
          <p>Please log in to your account to view and respond to this request.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
          </div>
          <p>Thank you for your willingness to help!</p>
          <p>Best regards,<br>Blood Donation Platform Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending request notification email:', error);
    throw new Error('Failed to send notification email');
  }
};