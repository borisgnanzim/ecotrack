const Validator = require('../../src/dto/Validator');

describe('Validator', () => {
  describe('isEmail', () => {
    it('should validate correct email', () => {
      expect(Validator.isEmail('test@example.com')).toBe(true);
      expect(Validator.isEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(Validator.isEmail('invalid')).toBe(false);
      expect(Validator.isEmail('invalid@')).toBe(false);
      expect(Validator.isEmail('@example.com')).toBe(false);
      expect(Validator.isEmail('')).toBe(false);
    });
  });

  describe('isPassword', () => {
    it('should validate password with minimum length', () => {
      expect(Validator.isPassword('Password123')).toBe(true);
      expect(Validator.isPassword('Pass99')).toBe(true);
    });

    it('should reject password below minimum length', () => {
      expect(Validator.isPassword('short')).toBe(false);
      expect(Validator.isPassword('abc')).toBe(false);
    });
  });

  describe('isUsername', () => {
    it('should validate correct username', () => {
      expect(Validator.isUsername('testuser')).toBe(true);
      expect(Validator.isUsername('user_123')).toBe(true);
      expect(Validator.isUsername('johndoe')).toBe(true);
    });

    it('should reject invalid username', () => {
      expect(Validator.isUsername('a')).toBe(false); // Too short
      expect(Validator.isUsername('ab')).toBe(false); // Too short
      expect(Validator.isUsername('us er')).toBe(false); // Contains space
    });
  });

  describe('isPhoneNumber', () => {
    it('should validate correct phone number', () => {
      expect(Validator.isPhoneNumber('0123456789')).toBe(true);
      expect(Validator.isPhoneNumber('+33123456789')).toBe(true);
      expect(Validator.isPhoneNumber('(123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone number', () => {
      expect(Validator.isPhoneNumber('123')).toBe(false); // Too short
      expect(Validator.isPhoneNumber('abc')).toBe(false); // Not a number
    });
  });

  describe('maxLength', () => {
    it('should validate string within max length', () => {
      expect(Validator.maxLength('test', 10)).toBe(true);
      expect(Validator.maxLength('test', 4)).toBe(true);
    });

    it('should reject string exceeding max length', () => {
      expect(Validator.maxLength('toolong', 3)).toBe(false);
    });
  });

  describe('minLength', () => {
    it('should validate string within min length', () => {
      expect(Validator.minLength('test', 3)).toBe(true);
      expect(Validator.minLength('test', 4)).toBe(true);
    });

    it('should reject string below min length', () => {
      expect(Validator.minLength('hi', 3)).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(Validator.isEmpty(null)).toBe(true);
      expect(Validator.isEmpty(undefined)).toBe(true);
      expect(Validator.isEmpty('  ')).toBe(true);
    });

    it('should detect non-empty values', () => {
      expect(Validator.isEmpty('test')).toBe(false);
      expect(Validator.isEmpty('0')).toBe(false);
    });
  });
});
