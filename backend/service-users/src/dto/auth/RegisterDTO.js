const { z } = require('zod');
const ValidationError = require('../ValidationError');

/**
 * Schéma Zod pour l'inscription utilisateur
 */
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

/**
 * DTO pour l'inscription utilisateur
 */
class RegisterDTO {
  constructor(data) {
    this.firstname = data?.firstname?.trim() || '';
    this.lastname = data?.lastname?.trim() || '';
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
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        password: this.password,
        passwordConfirm: this.passwordConfirm
      });

      // Met à jour les propriétés avec les données validées
      this.firstname = validatedData.firstname;
      this.lastname = validatedData.lastname;
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
      firstname: this.firstname,
      lastname: this.lastname,
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
      firstname: this.firstname,
      lastname: this.lastname,
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
