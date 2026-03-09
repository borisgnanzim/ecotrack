const { z } = require('zod');

/**
 * Classe utilitaire pour valider les données avec Zod
 */
class Validator {
  // Schémas Zod communs
  static email = z.string().email('Email invalide').trim().min(1, 'Email est requis');

  static password = z.string().min(6, 'Mot de passe invalide (minimum 6 caractères)');

  static username = z.string().min(3, 'Nom d\'utilisateur invalide (minimum 3 caractères)').regex(/^\S+$/, 'Nom d\'utilisateur ne peut pas contenir d\'espaces');

  static phoneNumber = z.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Numéro de téléphone invalide').optional();

  static string = z.string().trim().min(1, 'Champ requis');

  static number = z.number().finite('Doit être un nombre valide');

  static boolean = z.boolean();

  static date = z.string().datetime('Date invalide').or(z.date().transform(d => d.toISOString()));

  // Méthodes utilitaires pour validation manuelle (legacy support)
  static isEmail(email) {
    return this.email.safeParse(email).success;
  }

  static isPassword(password) {
    return this.password.safeParse(password).success;
  }

  static isUsername(username) {
    return this.username.safeParse(username).success;
  }

  static isEmpty(value) {
    return value === null || value === undefined || value.toString().trim() === '';
  }

  static isString(value) {
    return typeof value === 'string';
  }

  static isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  static maxLength(value, max) {
    return value.length <= max;
  }

  static minLength(value, min) {
    return value.length >= min;
  }

  static isPhoneNumber(phone) {
    return this.phoneNumber.safeParse(phone).success;
  }
}

module.exports = Validator;
