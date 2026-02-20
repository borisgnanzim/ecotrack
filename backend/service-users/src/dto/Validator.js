/**
 * Classe utilitaire pour valider les données
 */
class Validator {
  static isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isPassword(password) {
    // Au moins 6 caractères
    return password && password.length >= 6;
  }

  static isUsername(username) {
    // Au moins 3 caractères, pas d'espaces
    return username && username.length >= 3 && !/\s/.test(username);
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
    // Format basique pour numéros de téléphone
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }
}

module.exports = Validator;
