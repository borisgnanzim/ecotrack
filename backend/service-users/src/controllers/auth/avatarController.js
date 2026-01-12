const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const User = require('../../models/User');

exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `${userId}.webp`;
    const filepath = path.join(uploadsDir, filename);

    // Resize and convert to webp
    await sharp(req.file.buffer)
      .resize(256, 256)
      .webp({ quality: 80 })
      .toFile(filepath);

    // update user avatar url (store relative path, return absolute URL)
    const avatarUrl = `/uploads/avatars/${filename}`;
    const fullAvatarUrl = `${req.protocol}://${req.get('host')}${avatarUrl}`;
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });

    res.status(200).json({ avatarUrl: fullAvatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Serve avatar image for authenticated user or by user id
exports.getAvatar = async (req, res) => {
  try {
    // Prefer path param id, fall back to authenticated user id
    const userId = req.params.id || (req.user && req.user.id);
    if (!userId) return res.status(400).json({ message: 'Missing user id' });

    const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
    const filename = `${userId}.webp`;
    const filepath = path.join(avatarsDir, filename);

    let fileToSend;
    if (fs.existsSync(filepath)) {
      fileToSend = filepath;
    } else {
      fileToSend = path.join(process.cwd(), 'uploads', 'defaults', 'default_avatar.svg');
    }

    // Set cache headers and serve inline
    res.set('Cache-Control', 'public, max-age=86400');
    res.sendFile(fileToSend);
  } catch (err) {
    console.error('Avatar retrieval error:', err);
    res.status(500).json({ message: err.message });
  }
};