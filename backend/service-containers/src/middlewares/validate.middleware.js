// src/middlewares/validate.middleware.js
export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const message = error.errors?.[0]?.message || error.message || "Validation error";
      return res.status(400).json({ error: message });
    }
  };
}