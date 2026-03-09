const { z } = require('zod');
const ValidationError = require('../ValidationError');

/**
 * Schéma Zod pour l'inscription utilisateur
 */
const registerSchema = z.object({
  username: z.string()
    .min(3, 'Nom d\'utilisateur invalide (minimum 3 caractères)')
    .max(50, 'Nom d\'utilisateur trop long (max 50 caractères)')
    .regex(/^\S+$/, 'Nom d\'utilisateur ne peut pas contenir d\'espaces')
    .trim(),
  email: z.string().email('Email invalide').trim().min(1, 'Email est requis'),
  password: z.string()
    .min(6, 'Mot de passe invalide (minimum 6 caractères)')
    .max(100, 'Mot de passe trop long (max 100 caractères)'),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirm']
});

/**
 * DTO pour l'inscription utilisateur
 */
class RegisterDTO {
  constructor(data) {
    this.username = data?.username?.trim() || '';
    this.email = data?.email?.trim() || '';
    this.password = data?.password || '';
    this.passwordConfirm = data?.passwordConfirm || '';
  }

  /**
   * Valide les données d'entrée
   * @throws {ValidationError} Si les données ne sont pas valides
   */
  validate() {
    try {
      const validatedData = registerSchema.parse({
        username: this.username,
        email: this.email,
        password: this.password,
        passwordConfirm: this.passwordConfirm
      });

      // Met à jour les propriétés avec les données validées
      this.username = validatedData.username;
      this.email = validatedData.email;
      this.password = validatedData.password;

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }

  /**
   * Valide sans lancer d'erreur (retourne le résultat)
   */
  safeValidate() {
    return registerSchema.safeParse({
      username: this.username,
      email: this.email,
      password: this.password,
      passwordConfirm: this.passwordConfirm
    });
  }

  /**
   * Retourne les données validées (sans passwordConfirm)
   */
  toJSON() {
    return {
      username: this.username,
      email: this.email,
      password: this.password
    };
  }

  /**
   * Getter pour le schéma Zod
   */
  static get schema() {
    return registerSchema;
  }
}

module.exports = RegisterDTO;
