const AuthService = require('../../src/services/authService');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const notificationService = require('../../src/services/notificationService');

jest.mock('../../src/models/User');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../../src/services/notificationService');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerCitizen', () => {
    it('should register a new user with citizen role', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      };

      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        roles: [{ id: '1', name: 'citizen' }],
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(createdUser);
      User.addRole.mockResolvedValue(createdUser);
      User.findById.mockResolvedValue(createdUser);
      notificationService.sendWelcomeNotification.mockResolvedValue(createdUser);
      jwt.sign.mockReturnValue('jwt_token_here');

      const result = await AuthService.registerCitizen(userData);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalled();
      expect(User.addRole).toHaveBeenCalledWith(createdUser.id, 'citizen');
      expect(result).toEqual({
        token: 'jwt_token_here',
        user: createdUser,
        roles: ['citizen']
      });
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'Password123',
      };

      User.findOne.mockResolvedValue({ id: '1', email: 'existing@example.com' });

      await expect(AuthService.registerCitizen(userData)).rejects.toThrow();
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'Password123';

      const user = {
        id: '1',
        email: email,
        password: 'hashedPassword123',
        roles: [{ id: '1', name: 'citizen' }],
      };

      const token = 'jwt_token_here';

      User.findOne.mockResolvedValue(user);
      bcryptjs.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue(token);

      const result = await AuthService.login({ email, password });

      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(bcryptjs.compareSync).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(result.token).toBe(token);
    });

    it('should throw error with invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      const user = {
        id: '1',
        email: email,
        password: 'hashedPassword123',
      };

      User.findOne.mockResolvedValue(user);
      bcryptjs.compareSync.mockReturnValue(false);

      await expect(AuthService.login({ email, password })).rejects.toThrow();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        AuthService.login({ email: 'nonexistent@example.com', password: 'pass' })
      ).rejects.toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = 'valid_jwt_token';
      const decoded = { userId: '1', email: 'test@example.com' };

      jwt.verify.mockReturnValue(decoded);

      const result = AuthService.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalled();
      expect(result).toEqual(decoded);
    });

    it('should throw error if token is invalid', () => {
      const token = 'invalid_token';

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => AuthService.verifyToken(token)).toThrow();
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with user data', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        roles: [{ name: 'citizen' }],
      };

      const token = 'generated_jwt_token';
      jwt.sign.mockReturnValue(token);

      const result = AuthService.generateToken(user);

      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toBe(token);
    });
  });
});
