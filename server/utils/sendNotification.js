
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
export async function sendNotification({ userId, title, message, type }) {
  const link =  process.env.DEPLOYED_FRONTEND_URL
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
  const typeAllowed = prefs.types?.[typeKey] !== false;

  let notification = null;

  // In-app notification
  if (prefs.inApp && typeAllowed) {
    notification = await NotificationModel.create({
      userId,
      title,
      message,
      type,
      link,
    });
  }


  // Email notification with improved HTML UI
  if (prefs.email && typeAllowed) {
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 8px #f0f0f0;">
        <div style="background: #2d6cdf; color: #fff; padding: 18px 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 1.3em;">${title}</h2>
        </div>
        <div style="padding: 24px; color: #222;">
          <p style="font-size: 1.1em;">${message}</p>
          ${link ? `<a href="${link}" style="display: inline-block; margin-top: 18px; padding: 10px 22px; background: #2d6cdf; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">View Details</a>` : ''}
        </div>
        <div style="background: #f7f7f7; color: #888; padding: 12px 24px; border-radius: 0 0 8px 8px; font-size: 0.95em;">
          This is an automated message from Bootcamp Management System.
        </div>
      </div>
    `;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: title,
      text: message + (link ? `\nView: ${link}` : ''),
      html,
    });
  }

  return notification;
}
