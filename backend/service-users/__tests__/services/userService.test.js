const UserService = require('../../src/services/userService');
const User = require('../../src/models/User');

jest.mock('../../src/models/User');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: '1', username: 'user1', email: 'user1@example.com' },
        { id: '2', username: 'user2', email: 'user2@example.com' },
      ];

      User.find.mockResolvedValue(users);

      const result = await UserService.getAllUsers();

      expect(User.find).toHaveBeenCalled();
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no users', async () => {
      User.find.mockResolvedValue([]);

      const result = await UserService.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const user = { id: '1', username: 'testuser', email: 'test@example.com' };
      User.findById.mockResolvedValue(user);

      const result = await UserService.getUserById('1');

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(user);
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(UserService.getUserById('nonexistent')).rejects.toThrow();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'hashedPassword',
      };

      const createdUser = { id: '1', ...userData };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(createdUser);

      const result = await UserService.createUser(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(createdUser);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'hashedPassword',
      };

      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await expect(UserService.createUser(userData)).rejects.toThrow();
    });
  });

  describe('addRole', () => {
    it('should add a role to user', async () => {
      const userId = '1';
      const roleId = '2';
      const userWithRole = {
        id: userId,
        roles: [{ id: roleId, name: 'admin' }],
      };

      User.addRole.mockResolvedValue(userWithRole);

      const result = await UserService.addRole(userId, roleId);

      expect(User.addRole).toHaveBeenCalledWith(userId, roleId);
      expect(result.roles).toContainEqual(expect.objectContaining({ id: roleId }));
    });
  });

  describe('removeRole', () => {
    it('should remove a role from user', async () => {
      const userId = '1';
      const roleId = '2';
      const userWithoutRole = {
        id: userId,
        roles: [],
      };

      User.removeRole.mockResolvedValue(userWithoutRole);

      const result = await UserService.removeRole(userId, roleId);

      expect(User.removeRole).toHaveBeenCalledWith(userId, roleId);
      expect(result.roles).toHaveLength(0);
    });
  });
});
