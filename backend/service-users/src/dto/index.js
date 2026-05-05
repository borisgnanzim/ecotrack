const { z } = require('zod');

// Auth Schemas
const loginSchema = z.object({
  email: z.string().email('Email invalide').trim().min(1, 'Email est requis'),
  password: z.string().min(6, 'Mot de passe invalide (minimum 6 caractères)')
});

const registerSchema = z.object({
  firstname: z.string()
    .trim()
    .min(1, 'Prénom requis')
    .max(50, 'Prénom trop long (max 50 caractères)'),
  lastname: z.string()
    .trim()
    .min(1, 'Nom requis')
    .max(50, 'Nom trop long (max 50 caractères)'),
  email: z.string().email('Email invalide').trim().min(1, 'Email est requis'),
  password: z.string()
    .min(6, 'Mot de passe invalide (minimum 6 caractères)')
    .max(100, 'Mot de passe trop long (max 100 caractères)'),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirm']
});

// User Schemas
const createUserSchema = z.object({
  firstname: z.string()
    .trim()
    .min(1, 'Prénom requis')
    .max(50, 'Prénom trop long (max 50 caractères)'),
  lastname: z.string()
    .trim()
    .min(1, 'Nom requis')
    .max(50, 'Nom trop long (max 50 caractères)'),
  email: z.string().email('Email invalide').trim().min(1, 'Email est requis'),
  password: z.string()
    .min(6, 'Mot de passe invalide (minimum 6 caractères)')
    .max(100, 'Mot de passe trop long (max 100 caractères)'),
  address: z.string()
    .max(200, 'Adresse trop longue (max 200 caractères)')
    .optional(),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Numéro de téléphone invalide')
    .optional(),
  roleNames: z.array(z.string().min(1, 'Nom du rôle invalide')).optional()
});

const updateUserSchema = z.object({
  firstname: z.string()
    .trim()
    .min(1, 'Prénom requis')
    .max(50, 'Prénom trop long (max 50 caractères)')
    .optional(),
  lastname: z.string()
    .trim()
    .min(1, 'Nom requis')
    .max(50, 'Nom trop long (max 50 caractères)')
    .optional(),
  username: z.string()
    .min(3, 'Nom d\'utilisateur invalide (minimum 3 caractères)')
    .max(50, 'Nom d\'utilisateur trop long (max 50 caractères)')
    .regex(/^\S+$/, 'Nom d\'utilisateur ne peut pas contenir d\'espaces')
    .optional(),
  email: z.string().email('Email invalide').trim().optional(),
  name: z.string()
    .max(100, 'Nom trop long (max 100 caractères)')
    .optional(),
  address: z.string()
    .max(200, 'Adresse trop longue (max 200 caractères)')
    .optional(),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Numéro de téléphone invalide')
    .optional()
}).refine((data) => {
  return Object.values(data).some(value => value !== undefined);
}, {
  message: 'Au moins un champ doit être fourni pour la mise à jour'
});

// Profile Schemas
const updateProfileSchema = z.object({
  name: z.string()
    .max(100, 'Nom trop long (max 100 caractères)')
    .optional(),
  address: z.string()
    .max(200, 'Adresse trop longue (max 200 caractères)')
    .optional(),
  username: z.string()
    .min(3, 'Nom d\'utilisateur invalide (minimum 3 caractères)')
    .max(50, 'Nom d\'utilisateur trop long (max 50 caractères)')
    .regex(/^\S+$/, 'Nom d\'utilisateur ne peut pas contenir d\'espaces')
    .optional(),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Numéro de téléphone invalide')
    .optional()
}).refine((data) => {
  return Object.values(data).some(value => value !== undefined);
}, {
  message: 'Au moins un champ doit être fourni pour la mise à jour'
});

// Notification Schemas
const createNotificationSchema = z.object({
  userId: z.union([z.string(), z.number()]).optional(),
  title: z.string()
    .min(1, 'Titre requis')
    .max(200, 'Titre trop long (max 200 caractères)')
    .trim(),
  message: z.string()
    .min(1, 'Message requis')
    .max(1000, 'Message trop long (max 1000 caractères)')
    .trim(),
  type: z.enum(['info', 'warning', 'error', 'success'], {
    errorMap: () => ({ message: 'Type invalide (doit être: info, warning, error, success)' })
  }).default('info'),
  isRead: z.boolean().default(false)
});

// Utility function for validation
const validateWithZod = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const ValidationError = require('./ValidationError');
    throw ValidationError.fromZodError(result.error);
  }
  return result.data;
};

module.exports = {
  // Auth
  loginSchema,
  registerSchema,

  // User
  createUserSchema,
  updateUserSchema,

  // Profile
  updateProfileSchema,

  // Notification
  createNotificationSchema,

  // Utility
  validateWithZod
};
