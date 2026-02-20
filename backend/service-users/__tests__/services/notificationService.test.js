const NotificationService = require('../../src/services/notificationService');
const Notification = require('../../src/models/Notification');

jest.mock('../../src/models/Notification');

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      const notificationData = {
        userId: '1',
        title: 'Test Notification',
        message: 'This is a test',
        type: 'info',
      };

      const createdNotification = {
        id: '1',
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
      };

      Notification.create.mockResolvedValue(createdNotification);

      const result = await NotificationService.createNotification(
        notificationData
      );

      expect(Notification.create).toHaveBeenCalledWith(notificationData);
      expect(result).toEqual(createdNotification);
    });
  });

  describe('getNotifications', () => {
    it('should return user notifications', async () => {
      const userId = '1';
      const notifications = [
        {
          id: '1',
          userId,
          title: 'Notification 1',
          message: 'Message 1',
          isRead: false,
        },
        {
          id: '2',
          userId,
          title: 'Notification 2',
          message: 'Message 2',
          isRead: true,
        },
      ];

      Notification.find.mockResolvedValue(notifications);

      const result = await NotificationService.getNotifications(userId);

      expect(Notification.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(notifications);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no notifications', async () => {
      Notification.find.mockResolvedValue([]);

      const result = await NotificationService.getNotifications('1');

      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = '1';
      const readNotification = {
        id: notificationId,
        isRead: true,
      };

      Notification.update.mockResolvedValue(readNotification);

      const result = await NotificationService.markAsRead(notificationId);

      expect(Notification.update).toHaveBeenCalled();
      expect(result.isRead).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const notificationId = '1';
      Notification.delete.mockResolvedValue(true);

      await NotificationService.deleteNotification(notificationId);

      expect(Notification.delete).toHaveBeenCalledWith(notificationId);
    });
  });
});
