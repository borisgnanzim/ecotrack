const multer = require('multer');

// Use memory storage to process with sharp before saving
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Format non supporté. Formats acceptés: JPG, PNG, WebP'), false);
};

// Mitigation: limit the number of non-file form fields to prevent deep nesting attacks
// SNYK recommends setting `limits.fields` in addition to upgrading multer.
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, fields: 50 }, // 5MB and max 50 non-file fields
  fileFilter
});

module.exports = upload;