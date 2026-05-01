
import NotificationModel from '../models/Notifications.model.js';
import UserModel from '../models/User.model.js';
import transporter from './mailer.js';


/**
 * Utility to send a notification to a user, respecting their preferences.
 * @param {Object} options
 * @param {string|ObjectId} options.userId - The user to notify
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (e.g., 'BOOTCAMP_INVITE')
 * @returns {Promise<Object|null>} The created notification document or null if none sent
 */

/**
 * Utility to send a notification to a user, respecting their preferences.
 * @param {Object} options
 * @param {string|ObjectId} options.userId - The user to notify
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (e.g., 'BOOTCAMP_INVITE', 'BOOTCAMP_EXPELLED')
 * @param {string} [options.link] - Optional link for the notification
 * @returns {Promise<Object|null>} The created notification document or null if none sent
 */
export async function sendNotification({ userId, title, message, type }) {
  
  const link = process.env.DEPLOYED_FRONTEND_URL
  if (!userId || !title || !message || !type) {
    throw new Error('Missing required notification fields');
  }

  // Fetch user preferences
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new Error('User not found');
  const prefs = user.notificationPreferences || { email: true, inApp: true, types: {} };
  // Map type to preference key (e.g., BOOTCAMP_INVITE -> bootcamp)
  let typeKey = type.toLowerCase();
  if (typeKey.endsWith('_invite')) typeKey = typeKey.replace('_invite', '');
  if (typeKey.endsWith('_reminder')) typeKey = typeKey.replace('_reminder', '');
  if (typeKey.endsWith('_posted')) typeKey = typeKey.replace('_posted', '');
  if (typeKey.endsWith('_request')) typeKey = typeKey.replace('_request', '');
  if (typeKey.endsWith('_expelled')) typeKey = typeKey.replace('_expelled', '');
  const typeAllowed = prefs.types?.[typeKey] !== false;

  let notification = null;

  // In-app notification
  if (prefs.inApp && typeAllowed) {
    notification = await NotificationModel.create({
      userId,
      title,
      message,
      type,
      link
    });
  }

  // Email notification with improved HTML UI
  if (prefs.email && typeAllowed) {
  // Brand Configuration
  const brandColor = "#0B74C9"; // Vanguard Blue
  const secondaryColor = "#0469BE";
  const textColor = "#1F2937"; // Dark Gray

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, ${brandColor} 0%, ${secondaryColor} 100%); padding: 40px 30px; text-align: left; color: #ffffff; }
        .logo-text { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.8; margin-bottom: 8px; display: block; }
        .title { margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; }
        .content { padding: 40px 30px; color: ${textColor}; line-height: 1.6; }
        .message { font-size: 16px; margin-bottom: 30px; color: #4B5563; }
        .button { display: inline-block; padding: 14px 28px; background-color: ${brandColor}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 4px 12px rgba(11, 116, 201, 0.25); }
        .footer { background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #f3f4f6; }
        .footer-text { font-size: 12px; color: #9CA3AF; margin-bottom: 4px; }
        .csec-brand { font-weight: 800; color: ${brandColor}; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; }
        .preferences { margin-top: 15px; font-size: 11px; color: #D1D5DB; }
        .preferences a { color: ${brandColor}; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="logo-text">CSEC ASTU • Bootcamp Portal</span>
          <h1 class="title">${title}</h1>
        </div>
        <div class="content">
          <p class="message">${message.replace(/\n/g, '<br>')}</p>
          ${link ? `<a href="${link}" class="button">Access Workspace</a>` : ''}
        </div>
        <div class="footer">
          <div class="csec-brand">Computer Science & Engineering Club</div>
          <div class="footer-text">Adama Science and Technology University</div>
          <div class="footer-text">© ${new Date().getFullYear()} CSEC ASTU. All Rights Reserved.</div>
          <div class="preferences">
            You received this because of your notification settings. 
            <a href="${process.env.FRONTEND_URL}/settings">Manage Preferences</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"CSEC ASTU Portal" <${process.env.EMAIL_USER}>`, // Professional Sender Name
    to: user.email,
    subject: `[CSEC Portal] ${title}`, // Branded Subject Line
    text: `${message}\n\nView Details: ${link}`, // Plain text fallback
    html,
  });
}

  return notification;
}
