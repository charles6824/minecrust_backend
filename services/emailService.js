const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const emailTemplates = {
  otp: (name, otp) => ({
    subject: 'Verify Your Email - MineCrustTrading',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">MineCrustTrading</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <h2 style="color: #1e293b; margin-top: 0;">Welcome ${name}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Your email verification code is:</p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="background: #2563eb; color: white; padding: 15px 30px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">This code will expire in 10 minutes for security purposes.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      </div>
    `
  }),
  
  registration: (name) => ({
    subject: 'Welcome to MineCrustTrading!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Welcome ${name}!</h2>
        <p>Your account has been successfully created.</p>
        <p>You can now start investing with us.</p>
      </div>
    `
  }),

  deposit: (name, amount, status) => ({
    subject: `Deposit ${status} - MineCrustTrading`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hello ${name},</h2>
        <p>Your deposit of $${amount} is ${status}.</p>
        ${status === 'pending' ? '<p>We will process it shortly.</p>' : '<p>Your balance has been updated.</p>'}
      </div>
    `
  }),

  withdrawal: (name, amount, status) => ({
    subject: `Withdrawal ${status} - MineCrustTrading`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hello ${name},</h2>
        <p>Your withdrawal of $${amount} is ${status}.</p>
      </div>
    `
  }),

  investment: (name, amount, packageName) => ({
    subject: 'Investment Successful - MineCrustTrading',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hello ${name},</h2>
        <p>You have successfully invested $${amount} in ${packageName}.</p>
      </div>
    `
  }),

  adminNotification: (type, userEmail, details) => ({
    subject: `New ${type} - MineCrustTrading Admin`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New ${type}</h2>
        <p>User: ${userEmail}</p>
        <p>Details: ${details}</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, ...args) => {
  try {
    const emailContent = emailTemplates[template](...args);
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'MineCrustTrading <noreply@minecrust.com>',
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log(`Email sent successfully to ${to}: ${template}`, data);
    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = { sendEmail };