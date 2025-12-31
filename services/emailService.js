const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email templates
const emailTemplates = {
  otp: (name, otp) => ({
    subject: 'Verify Your Email - MineCrustTrading',
    html: `
      <h2>Welcome to MineCrustTrading, ${name}!</h2>
      <p>Your OTP verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  }),
  
  registration: (name) => ({
    subject: 'Welcome to MineCrustTrading!',
    html: `
      <h2>Welcome ${name}!</h2>
      <p>Your account has been successfully created.</p>
      <p>You can now start investing with us.</p>
    `
  }),

  deposit: (name, amount, status) => ({
    subject: `Deposit ${status} - MineCrustTrading`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your deposit of $${amount} is ${status}.</p>
      ${status === 'pending' ? '<p>We will process it shortly.</p>' : '<p>Your balance has been updated.</p>'}
    `
  }),

  withdrawal: (name, amount, status) => ({
    subject: `Withdrawal ${status} - MineCrustTrading`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your withdrawal of $${amount} is ${status}.</p>
    `
  }),

  investment: (name, amount, packageName) => ({
    subject: 'Investment Successful - MineCrustTrading',
    html: `
      <h2>Hello ${name},</h2>
      <p>You have successfully invested $${amount} in ${packageName}.</p>
    `
  }),

  adminNotification: (type, userEmail, details) => ({
    subject: `New ${type} - MineCrustTrading Admin`,
    html: `
      <h2>New ${type}</h2>
      <p>User: ${userEmail}</p>
      <p>Details: ${details}</p>
    `
  })
};

// Send email function
const sendEmail = async (to, template, ...args) => {
  try {
    const emailContent = emailTemplates[template](...args);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    });
    console.log(`Email sent to ${to}: ${template}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

module.exports = { sendEmail };