const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };
  
  await transporter.sendMail(mailOptions);
};

/**
 * Send welcome email after registration
 * @param {String} email - User email
 * @param {String} name - User name
 * @returns {Promise<void>}
 */
exports.sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Artify Ghibli!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a6fe2;">Welcome to Artify Ghibli, ${name}!</h1>
        <p>Thank you for joining our platform. We're excited to have you with us!</p>
        <p>With Artify Ghibli, you can transform your photos into magical Ghibli-style artwork.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/plans" style="background-color: #4a6fe2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Explore Subscription Plans</a>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Magical regards,<br>The Artify Ghibli Team</p>
      </div>
    `
  });
};

/**
 * Send subscription confirmation email
 * @param {String} email - User email
 * @param {String} name - User name
 * @param {String} planName - Plan name
 * @param {Number} imagesLimit - Number of images
 * @returns {Promise<void>}
 */
exports.sendSubscriptionConfirmation = async (email, name, planName, imagesLimit) => {
  await sendEmail({
    to: email,
    subject: 'Your Artify Ghibli Subscription is Active!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a6fe2;">Your Subscription is Active!</h1>
        <p>Hello ${name},</p>
        <p>Thank you for subscribing to Artify Ghibli. Your <strong>${planName}</strong> is now active.</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f5f8ff; border-radius: 4px;">
          <h2 style="margin-top: 0; color: #4a6fe2;">Subscription Details</h2>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Image Credits:</strong> ${imagesLimit}</p>
        </div>
        <p>You can now start generating magical Ghibli-style artwork!</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/generate" style="background-color: #4a6fe2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Start Creating</a>
        </div>
        <p>Magical regards,<br>The Artify Ghibli Team</p>
      </div>
    `
  });
};

/**
 * Send email when image generation is completed
 * @param {String} email - User email
 * @param {String} name - User name
 * @param {String} imageName - Generated image name
 * @param {String} imageUrl - Generated image URL
 * @returns {Promise<void>}
 */
exports.sendImageGenerationCompleted = async (email, name, imageName, imageUrl) => {
  await sendEmail({
    to: email,
    subject: 'Your Ghibli Artwork is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a6fe2;">Your Magical Artwork is Ready!</h1>
        <p>Hello ${name},</p>
        <p>Great news! Your image "${imageName}" has been transformed into Ghibli-style artwork.</p>
        <div style="margin: 20px 0;">
          <img src="${imageUrl}" alt="Generated Artwork" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        </div>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #4a6fe2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View in Dashboard</a>
        </div>
        <p>Magical regards,<br>The Artify Ghibli Team</p>
      </div>
    `
  });
};

/**
 * Send email when image generation fails
 * @param {String} email - User email
 * @param {String} name - User name
 * @param {String} imageName - Image name
 * @returns {Promise<void>}
 */
exports.sendImageGenerationFailed = async (email, name, imageName) => {
  await sendEmail({
    to: email,
    subject: 'Image Generation Issue',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e74c3c;">Image Generation Issue</h1>
        <p>Hello ${name},</p>
        <p>We encountered an issue while generating your Ghibli-style artwork for "${imageName}".</p>
        <p>Not to worry, we haven't used up your image credit, and you can try again with a different image.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/generate" style="background-color: #4a6fe2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Try Again</a>
        </div>
        <p>If you continue to experience issues, please contact our support team.</p>
        <p>Magical regards,<br>The Artify Ghibli Team</p>
      </div>
    `
  });
};

/**
 * Send email when user reaches their image limit
 * @param {String} email - User email
 * @param {String} name - User name
 * @param {String} planId - Plan ID
 * @returns {Promise<void>}
 */
exports.sendImageLimitReached = async (email, name, planId) => {
  await sendEmail({
    to: email,
    subject: 'Image Generation Limit Reached',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f39c12;">You've Used All Your Image Credits</h1>
        <p>Hello ${name},</p>
        <p>You've used all the image credits in your current plan.</p>
        <p>To generate more magical Ghibli-style artwork, you can upgrade your plan or purchase a new subscription.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/plans" style="background-color: #4a6fe2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Upgrade Plan</a>
        </div>
        <p>Magical regards,<br>The Artify Ghibli Team</p>
      </div>
    `
  });
};

/**
 * Send notification about new support ticket to admin
 * @param {String} subject - Ticket subject
 * @param {String} message - User message
 * @param {String} userEmail - User email
 * @param {String} userName - User name
 * @param {String} ticketId - Ticket ID
 * @returns {Promise<void>}
 */
exports.sendNewSupportTicketNotification = async (subject, message, userEmail, userName, ticketId) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Support Ticket: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a6fe2;">New Support Ticket</h1>
        <div style="margin: 20px 0; padding: 20px; background-color: #f5f8ff; border-radius: 4px;">
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>User:</strong> ${userName} (${userEmail})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${message}
          </div>
        </div>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/admin/support/ticket/${ticketId}" style="background-color: #4a6fe2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Ticket</a>
        </div>
      </div>
    `
  });
};

/**
 * Send notification to user when admin replies to their ticket
 * @param {String} email - User email
 * @param {String} name - User name
 * @param {String} subject - Ticket subject
 * @param {String} message - Admin reply
 * @param {String} ticketId - Ticket ID
 * @returns {Promise<void>}
 */
exports.sendTicketReplyNotification = async (email, name, subject, message, ticketId) => {
  await sendEmail({
    to: email,
    subject: `Support Update: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a6fe2;">Support Ticket Update</h1>
        <p>Hello ${name},</p>
        <p>We've replied to your support ticket regarding "${subject}".</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f5f8ff; border-radius: 4px;">
          <p><strong>Our Response:</strong></p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${message}
          </div>
        </div>
        <p>You can continue the conversation by replying to this ticket in your dashboard.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/support/ticket/${ticketId}" style="background-color: #4a6fe2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Conversation</a>
        </div>
        <p>Magical regards,<br>The Artify Ghibli Team</p>
      </div>
    `
  });
};

/**
 * Send notification to admin when user updates their ticket
 * @param {String} subject - Ticket subject
 * @param {String} message - User message
 * @param {String} userEmail - User email
 * @param {String} userName - User name
 * @param {String} ticketId - Ticket ID
 * @returns {Promise<void>}
 */
exports.sendTicketUpdatedNotification = async (subject, message, userEmail, userName, ticketId) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `Support Ticket Updated: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a6fe2;">Support Ticket Updated</h1>
        <div style="margin: 20px 0; padding: 20px; background-color: #f5f8ff; border-radius: 4px;">
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>User:</strong> ${userName} (${userEmail})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>New Message:</strong></p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${message}
          </div>
        </div>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/admin/support/ticket/${ticketId}" style="background-color: #4a6fe2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Ticket</a>
        </div>
      </div>
    `
  });
};

module.exports = exports;