const { z } = require('zod');
const ValidationError = require('../ValidationError');

/**
 * Schéma Zod pour la connexion utilisateur
 */
const loginSchema = z.object({
  email: z.string().email('Email invalide').trim().min(1, 'Email est requis'),
  password: z.string().min(6, 'Mot de passe invalide (minimum 6 caractères)')
});

/**
 * DTO pour la connexion utilisateur
 */
class LoginDTO {
  constructor(data) {
    this.email = data?.email?.trim() || '';
    this.password = data?.password || '';
  }

  /**
   * Valide les données d'entrée
   * @throws {ValidationError} Si les données ne sont pas valides
   */
  validate() {
    try {
      const validatedData = loginSchema.parse({
        email: this.email,
        password: this.password
      });

      // Met à jour les propriétés avec les données validées
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
    return loginSchema.safeParse({
      email: this.email,
      password: this.password
    });
  }

  /**
   * Retourne les données validées
   */
  toJSON() {
    return {
      email: this.email,
      password: this.password
    };
  }

  /**
   * Getter pour le schéma Zod
   */
  static get schema() {
    return loginSchema;
  }
}

module.exports = LoginDTO;
