const ProfileService = require('../../src/services/profileService');
const User = require('../../src/models/User');

jest.mock('../../src/models/User');

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = '1';
      const user = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        address: '123 Main St',
        avatar: 'avatar.webp',
        roles: [{ id: '1', name: 'citizen' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      User.findById.mockResolvedValue(user);

      const result = await ProfileService.getProfile(userId);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result.id).toBe(userId);
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(ProfileService.getProfile('nonexistent')).rejects.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userId = '1';
      const updateData = {
        username: 'updateduser',
      };

      const user = { id: userId };
      const updatedUser = {
        id: userId,
        username: 'updateduser',
        email: 'test@example.com',
        roles: [],
      };

      User.findById.mockResolvedValue(user);
      User.update.mockResolvedValue(updatedUser);

      const result = await ProfileService.updateProfile(userId, updateData);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(User.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(
        ProfileService.updateProfile('nonexistent', { username: 'new' })
      ).rejects.toThrow();
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      const userId = '1';
      const avatarPath = '/uploads/avatars/1.webp';

      const updatedProfile = {
        id: userId,
        avatar: avatarPath,
      };

      User.update.mockResolvedValue(updatedProfile);

      const result = await ProfileService.updateAvatar(userId, avatarPath);

      expect(User.update).toHaveBeenCalled();
      expect(result).toEqual(updatedProfile);
    });
  });
});
