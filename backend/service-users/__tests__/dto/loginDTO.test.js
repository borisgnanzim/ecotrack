const LoginDTO = require('../../src/dto/auth/LoginDTO');
const ValidationError = require('../../src/dto/ValidationError');

describe('LoginDTO', () => {
  describe('validate', () => {
    it('should validate correct login data', () => {
      const dto = new LoginDTO({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(() => dto.validate()).not.toThrow();
    });

    it('should throw error for missing email', () => {
      const dto = new LoginDTO({
        password: 'Password123',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });

    it('should throw error for invalid email format', () => {
      const dto = new LoginDTO({
        email: 'invalid-email',
        password: 'Password123',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });

    it('should throw error for missing password', () => {
      const dto = new LoginDTO({
        email: 'test@example.com',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });

    it('should throw error for weak password', () => {
      const dto = new LoginDTO({
        email: 'test@example.com',
        password: 'weak',
      });

      expect(() => dto.validate()).toThrow(ValidationError);
    });
  });

  describe('toJSON', () => {
    it('should return clean object with only allowed fields', () => {
      const dto = new LoginDTO({
        email: 'test@example.com',
        password: 'Password123',
        extraField: 'should be ignored',
      });

      const result = dto.toJSON();

      expect(result).toEqual({
        email: 'test@example.com',
        password: 'Password123',
      });
      expect(result).not.toHaveProperty('extraField');
    });
  });
});
