import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import './Notifications.css';

const Notifications = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteOne(notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'post_reaction':
        return '👍';
      case 'announcement_approved':
        return '✅';
      case 'new_message':
        return '💬';
      case 'review_helpful':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h2 className="notifications-title">Notifications</h2>
          <div className="notifications-headerActions">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="notifications-markAllBtn"
              >
                Mark all as read
              </button>
            )}
            <button onClick={onClose} className="notifications-closeBtn">×</button>
          </div>
        </div>

        <div className="notifications-content">
          {loading ? (
            <div className="notifications-loading">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="notifications-emptyIcon">🔔</div>
              <p className="notifications-emptyText">No notifications yet</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notifications-item ${notification.read ? 'notifications-item--read' : 'notifications-item--unread'}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                >
                  <div className="notifications-itemContent">
                    <div className="notifications-iconContainer">
                      <span className="notifications-icon">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="notifications-textContainer">
                      <h4 className="notifications-notificationTitle">{notification.title}</h4>
                      <p className="notifications-notificationMessage">{notification.message}</p>
                      <span className="notifications-time">{formatTime(notification.createdAt)}</span>
                    </div>
                    {!notification.read && (
                      <div className="notifications-unreadDot"></div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification._id);
                    }}
                    className="notifications-deleteBtn"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

