import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";

export default function errorHandler(err, req, res, next) {
  // Zod → Validation
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: err.errors,
    });
  }

  // Erreurs métier
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Erreur inconnue → LOG
  console.error("🔥 ERREUR INATTENDUE", err);

  return res.status(500).json({
    error: "Erreur serveur",
  });
}