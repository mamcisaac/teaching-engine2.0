import BaseService from './base/BaseService';
import * as emailService from './emailService';

export interface Notification {
  id: string;
  userId: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('in_app' | 'email' | 'push')[];
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
  createdAt: Date;
}

export interface NotificationPreferences {
  userId: number;
  emailEnabled: boolean;
  pushEnabled: boolean;
  quietHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  categories: {
    [category: string]: {
      enabled: boolean;
      channels: ('in_app' | 'email' | 'push')[];
    };
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  messageTemplate: string;
  defaultChannels: ('in_app' | 'email' | 'push')[];
  variables: string[];
}

export class NotificationService extends BaseService {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<number, NotificationPreferences> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    super('NotificationService');
    this.initializeDefaultTemplates();
    this.startCleanupTask();
  }

  /**
   * Send a notification to a user
   */
  async sendNotification(
    userId: number,
    notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>
  ): Promise<string> {
    try {
      this.validateRequired({ userId, title: notification.title, message: notification.message }, 
        ['userId', 'title', 'message']);

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const fullNotification: Notification = {
        id: notificationId,
        userId,
        createdAt: new Date(),
        ...notification
      };

      // Check user preferences
      const userPrefs = await this.getUserPreferences(userId);
      const effectiveChannels = this.filterChannelsByPreferences(
        notification.channels, 
        userPrefs
      );

      if (effectiveChannels.length === 0) {
        this.logger.info({ userId, notificationId }, 'No enabled channels for notification');
        return notificationId;
      }

      // Store in-app notification
      if (effectiveChannels.includes('in_app')) {
        this.notifications.set(notificationId, fullNotification);
      }

      // Send email notification
      if (effectiveChannels.includes('email') && userPrefs.emailEnabled) {
        await this.sendEmailNotification(userId, fullNotification);
      }

      // Send push notification (placeholder for future implementation)
      if (effectiveChannels.includes('push') && userPrefs.pushEnabled) {
        await this.sendPushNotification(userId, fullNotification);
      }

      this.logger.info({ 
        userId, 
        notificationId, 
        type: notification.type,
        channels: effectiveChannels 
      }, 'Notification sent successfully');

      return notificationId;
    } catch (error) {
      this.handleError(error, { userId, notification });
    }
  }

  /**
   * Send notification using a template
   */
  async sendTemplatedNotification(
    userId: number,
    templateId: string,
    variables: Record<string, string>,
    options: {
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      channels?: ('in_app' | 'email' | 'push')[];
      expiresAt?: Date;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<string> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Replace template variables
      let message = template.messageTemplate;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        message = message.replace(regex, value);
      }

      let title = template.title;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        title = title.replace(regex, value);
      }

      return await this.sendNotification(userId, {
        type: template.type,
        title,
        message,
        priority: options.priority || 'medium',
        channels: options.channels || template.defaultChannels,
        metadata: options.metadata,
        expiresAt: options.expiresAt
      });
    } catch (error) {
      this.handleError(error, { userId, templateId, variables });
    }
  }

  /**
   * Get in-app notifications for a user
   */
  async getUserNotifications(
    userId: number,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const { limit = 50, offset = 0, unreadOnly = false } = options;
      
      const userNotifications = Array.from(this.notifications.values())
        .filter(n => n.userId === userId)
        .filter(n => !unreadOnly || !this.isNotificationRead(n.id))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const total = userNotifications.length;
      const unreadCount = userNotifications.filter(n => !this.isNotificationRead(n.id)).length;
      const notifications = userNotifications.slice(offset, offset + limit);

      return { notifications, total, unreadCount };
    } catch (error) {
      this.handleError(error, { userId, options });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: number): Promise<boolean> {
    try {
      const notification = this.notifications.get(notificationId);
      if (!notification || notification.userId !== userId) {
        return false;
      }

      // In a real implementation, you'd store read status in database
      // For now, we'll use a simple in-memory approach
      this.setNotificationRead(notificationId, true);

      this.logger.debug({ notificationId, userId }, 'Notification marked as read');
      return true;
    } catch (error) {
      this.logger.error({ error, notificationId, userId }, 'Failed to mark notification as read');
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<number> {
    try {
      let markedCount = 0;
      
      for (const notification of this.notifications.values()) {
        if (notification.userId === userId && !this.isNotificationRead(notification.id)) {
          this.setNotificationRead(notification.id, true);
          markedCount++;
        }
      }

      this.logger.info({ userId, markedCount }, 'Marked all notifications as read');
      return markedCount;
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to mark all notifications as read');
      return 0;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: number): Promise<boolean> {
    try {
      const notification = this.notifications.get(notificationId);
      if (!notification || notification.userId !== userId) {
        return false;
      }

      this.notifications.delete(notificationId);
      this.logger.debug({ notificationId, userId }, 'Notification deleted');
      return true;
    } catch (error) {
      this.logger.error({ error, notificationId, userId }, 'Failed to delete notification');
      return false;
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: number, 
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const current = this.preferences.get(userId) || this.getDefaultPreferences(userId);
      const updated = { ...current, ...preferences, userId };
      
      this.preferences.set(userId, updated);
      
      // TODO: Persist to database
      this.logger.info({ userId }, 'User notification preferences updated');
    } catch (error) {
      this.handleError(error, { userId, preferences });
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: number): Promise<NotificationPreferences> {
    try {
      let prefs = this.preferences.get(userId);
      
      if (!prefs) {
        // Try to load from database
        // TODO: Load from database
        prefs = this.getDefaultPreferences(userId);
        this.preferences.set(userId, prefs);
      }

      return prefs;
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to get user preferences');
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Create a custom notification template
   */
  createTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
    this.logger.info({ templateId: template.id, name: template.name }, 'Notification template created');
  }

  /**
   * Get available notification templates
   */
  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotification(
    userIds: number[],
    notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>
  ): Promise<{
    sent: string[];
    failed: { userId: number; error: string }[];
  }> {
    const operations = userIds.map(userId => 
      () => this.sendNotification(userId, notification)
    );

    const { results, errors } = await this.withParallel(operations, { 
      failFast: false, 
      maxConcurrency: 10 
    });

    const sent: string[] = [];
    const failed: { userId: number; error: string }[] = [];

    for (let i = 0; i < userIds.length; i++) {
      if (results[i] !== null) {
        sent.push(results[i] as string);
      } else {
        failed.push({
          userId: userIds[i],
          error: errors[i]?.message || 'Unknown error'
        });
      }
    }

    this.logger.info({ 
      totalUsers: userIds.length, 
      sent: sent.length, 
      failed: failed.length 
    }, 'Bulk notification completed');

    return { sent, failed };
  }

  // Private methods

  private async sendEmailNotification(userId: number, notification: Notification): Promise<void> {
    try {
      // Get user email
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (!user?.email) {
        throw new Error('User email not found');
      }

      // Check quiet hours
      const prefs = await this.getUserPreferences(userId);
      if (this.isInQuietHours(prefs.quietHours)) {
        this.logger.debug({ userId }, 'Skipping email due to quiet hours');
        return;
      }

      const subject = `[Teaching Engine] ${notification.title}`;
      const html = this.formatEmailNotification(notification, user.name);

      await emailService.sendEmail(user.email, subject, notification.message, html);
      
      this.logger.debug({ userId, notificationId: notification.id }, 'Email notification sent');
    } catch (error) {
      this.logger.error({ error, userId, notificationId: notification.id }, 
        'Failed to send email notification');
    }
  }

  private async sendPushNotification(userId: number, notification: Notification): Promise<void> {
    // TODO: Implement push notifications
    this.logger.debug({ userId, notificationId: notification.id }, 
      'Push notification not yet implemented');
  }

  private filterChannelsByPreferences(
    requestedChannels: ('in_app' | 'email' | 'push')[],
    preferences: NotificationPreferences
  ): ('in_app' | 'email' | 'push')[] {
    return requestedChannels.filter(channel => {
      switch (channel) {
        case 'email':
          return preferences.emailEnabled;
        case 'push':
          return preferences.pushEnabled;
        case 'in_app':
          return true; // Always allow in-app notifications
        default:
          return false;
      }
    });
  }

  private formatEmailNotification(notification: Notification, userName: string): string {
    const priorityColor = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    }[notification.priority];

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${priorityColor}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">${notification.title}</h1>
        </div>
        <div style="padding: 20px; background-color: #f8f9fa;">
          <p>Hello ${userName},</p>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            ${notification.message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #6c757d; font-size: 12px;">
            This is an automated notification from Teaching Engine 2.0.<br>
            Priority: ${notification.priority.toUpperCase()}<br>
            Sent: ${notification.createdAt.toLocaleString()}
          </p>
        </div>
      </div>
    `;
  }

  private getDefaultPreferences(userId: number): NotificationPreferences {
    return {
      userId,
      emailEnabled: true,
      pushEnabled: false,
      quietHours: {
        start: '22:00',
        end: '07:00'
      },
      categories: {
        milestone: { enabled: true, channels: ['in_app', 'email'] },
        activity: { enabled: true, channels: ['in_app'] },
        system: { enabled: true, channels: ['in_app', 'email'] },
        reminder: { enabled: true, channels: ['in_app'] }
      }
    };
  }

  private isInQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = quietHours;
    
    if (start <= end) {
      // Same day quiet hours (e.g., 22:00 to 23:59)
      return currentTime >= start && currentTime <= end;
    } else {
      // Cross-midnight quiet hours (e.g., 22:00 to 07:00)
      return currentTime >= start || currentTime <= end;
    }
  }

  private isNotificationRead(notificationId: string): boolean {
    // In a real implementation, store read status in database
    // For now, use a simple in-memory Set
    return this.readNotifications.has(notificationId);
  }

  private setNotificationRead(notificationId: string, read: boolean): void {
    if (read) {
      this.readNotifications.add(notificationId);
    } else {
      this.readNotifications.delete(notificationId);
    }
  }

  private readNotifications = new Set<string>();

  private initializeDefaultTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'milestone_deadline',
        name: 'Milestone Deadline',
        type: 'warning',
        title: 'Milestone Deadline Approaching',
        messageTemplate: 'The milestone "{{milestoneName}}" is due on {{dueDate}}. You have {{daysLeft}} days remaining.',
        defaultChannels: ['in_app', 'email'],
        variables: ['milestoneName', 'dueDate', 'daysLeft']
      },
      {
        id: 'activity_completed',
        name: 'Activity Completed',
        type: 'success',
        title: 'Activity Completed',
        messageTemplate: 'Great job! You have completed the activity "{{activityName}}".',
        defaultChannels: ['in_app'],
        variables: ['activityName']
      },
      {
        id: 'coverage_gap',
        name: 'Coverage Gap Alert',
        type: 'warning',
        title: 'Curriculum Coverage Gap Detected',
        messageTemplate: 'We detected a gap in your curriculum coverage for {{subject}}. Consider reviewing outcomes: {{outcomes}}.',
        defaultChannels: ['in_app', 'email'],
        variables: ['subject', 'outcomes']
      },
      {
        id: 'system_maintenance',
        name: 'System Maintenance',
        type: 'info',
        title: 'Scheduled Maintenance',
        messageTemplate: 'Teaching Engine will undergo maintenance on {{date}} from {{startTime}} to {{endTime}}. Please save your work.',
        defaultChannels: ['in_app', 'email'],
        variables: ['date', 'startTime', 'endTime']
      }
    ];

    for (const template of templates) {
      this.templates.set(template.id, template);
    }
  }

  private startCleanupTask(): void {
    // Clean up expired notifications every hour
    this.cleanupInterval = setInterval(() => {
      const now = new Date();
      let cleanedCount = 0;

      for (const [id, notification] of this.notifications.entries()) {
        if (notification.expiresAt && notification.expiresAt < now) {
          this.notifications.delete(id);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.info({ cleanedCount }, 'Cleaned up expired notifications');
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Cleanup resources on service shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();