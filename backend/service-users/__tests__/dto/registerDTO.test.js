const RegisterDTO = require('../../src/dto/auth/RegisterDTO');
const ValidationError = require('../../src/dto/ValidationError');

describe('RegisterDTO', () => {
  describe('validate', () => {
    it('should validate correct registration data', () => {
      const dto = new RegisterDTO({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'newuser@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
      });

      expect(() => dto.validate()).not.toThrow();
    });

    it('should throw error for missing lastname', () => {
      const dto = new RegisterDTO({
        firstname: 'Jane',
        email: 'test@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });

    it('should throw error for invalid firstname or lastname', () => {
      const dto = new RegisterDTO({
        firstname: 'A',
        lastname: '',
        email: 'test@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });

    it('should throw error for missing email', () => {
      const dto = new RegisterDTO({
        firstname: 'Jane',
        lastname: 'Doe',
        password: 'Password123',
        passwordConfirm: 'Password123',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });

    it('should throw error for invalid email', () => {
      const dto = new RegisterDTO({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'invalid',
        password: 'Password123',
        passwordConfirm: 'Password123',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });

    it('should throw error for missing password', () => {
      const dto = new RegisterDTO({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'test@example.com',
        passwordConfirm: 'Password123',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });

    it('should throw error for weak password', () => {
      const dto = new RegisterDTO({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'test@example.com',
        password: 'weak',
        passwordConfirm: 'weak',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });

    it('should throw error if passwords do not match', () => {
      const dto = new RegisterDTO({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'test@example.com',
        password: 'Password123',
        passwordConfirm: 'DifferentPassword456',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });
  });

  describe('toJSON', () => {
    it('should return clean object with only allowed fields', () => {
      const dto = new RegisterDTO({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'newuser@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
        adminField: 'should be ignored',
      });

      const result = dto.toJSON();

      expect(result).toEqual({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'newuser@example.com',
        password: 'Password123',
      });
      expect(result).not.toHaveProperty('adminField');
      expect(result).not.toHaveProperty('passwordConfirm');
    });
  });
});
