const Notification = require('../models/Notification');

const MODE = process.env.NOTIFICATION_MODE || 'local'; // 'local' or 'http'
const HTTP_ENDPOINT = process.env.NOTIFICATION_SERVICE_URL || null;

async function publishToHttp(data) {
  if (!HTTP_ENDPOINT) throw new Error('NOTIFICATION_SERVICE_URL not configured');
  // node >=18 has global fetch
  const res = await fetch(`${HTTP_ENDPOINT.replace(/\/+$/, '')}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP publish failed: ${res.status} ${text}`);
  }
  return res.json();
}

module.exports = {
  async sendWelcomeNotification(user) {
    const payload = {
      userId: user.id,
      title: 'Bienvenue',
      message: `Bienvenue sur Ecotrack, ${user.name || user.username}!`,
      type: 'info',
    };

    if (MODE === 'http') {
      return publishToHttp(payload);
    }

    // default local mode: create in DB directly
    return Notification.create(payload);
  },

  // Generic publisher used by other controllers/services
  async publishNotification(data) {
    if (MODE === 'http') return publishToHttp(data);
    return Notification.create(data);
  }
};
