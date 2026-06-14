const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join('.') || e.path[0] || 'unknown',
      message: e.message,
    }));
    return res.status(400).json({ error: 'Données invalides', details: errors });
  }
  req.body = result.data;
  next();
};

module.exports = { validate };
