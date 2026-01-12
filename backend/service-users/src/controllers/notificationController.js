const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const User = require('../models/User');

const secret_key = process.env.JWT_SECRET || 'your_secret_key';

function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const e = new Error('No token provided'); e.status = 401; throw e;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, secret_key);
  } catch (err) {
    const e = new Error('Invalid token'); e.status = 401; throw e;
  }
}

exports.getNotifications = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const notifications = await Notification.findByUserId(user.id);
    res.status(200).json({ notifications: notifications, message: 'Notifications retrieved successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const id = req.params.id;
    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification non trouvée' });

    // Permission: only owner can mark as read
    if (!notif.userId || notif.userId !== user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const updated = await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const id = req.params.id;
    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification non trouvée' });

    // Permission: only owner can delete
    if (!notif.userId || notif.userId !== user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: 'Notification supprimée' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const data = req.body || {};
    // If no userId provided, assign to the connected user
    if (!data.userId) data.userId = user.id;

    const created = await Notification.create(data);
    res.status(201).json(created);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};