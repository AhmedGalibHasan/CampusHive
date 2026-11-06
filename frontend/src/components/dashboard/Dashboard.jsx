import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Notifications from '../notifications/Notifications';
import notificationService from '../../services/notificationService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const features = [
    {
      title: 'Faculty Review',
      description: 'Review and rate your professors',
      icon: '👨‍🏫',
      path: '/teachers',
      color: '#3b82f6'
    },
    {
      title: 'Campus Feed',
      description: 'Share posts and connect with campus community',
      icon: '📝',
      path: '/feed',
      color: '#10b981'
    },
    {
      title: 'Chat',
      description: 'Message other students',
      icon: '💬',
      path: '/chat',
      color: '#8b5cf6'
    },
    {
      title: 'Ride Buddy',
      description: 'Find or offer ride sharing',
      icon: '🚗',
      path: '/ride-buddy',
      color: '#f59e0b'
    },
    {
      title: 'Clubs',
      description: 'Join campus clubs and communities',
      icon: '🎯',
      path: '/clubs',
      color: '#ec4899'
    },
    {
      title: 'Events',
      description: 'Discover and register for campus events',
      icon: '📅',
      path: '/events',
      color: '#06b6d4'
    },
    {
      title: 'Study Corner',
      description: 'Create and join study sessions',
      icon: '📚',
      path: '/study-rooms',
      color: '#6366f1'
    }
  ];

  return (
    <div className="dashboard-page">
      {/* User Info Section */}
      <div className="dashboard-userInfoSection">
        <div className="dashboard-userInfoContent">
          <div className="dashboard-userAvatar">
            {(user?.name || 'U').slice(0,1).toUpperCase()}
          </div>
          <div className="dashboard-userDetails">
            <h2 className="dashboard-userName">{user?.name || 'User'}</h2>
            <div className="dashboard-userMeta">
              <span className="dashboard-userEmail">📧 {user?.email || 'No email'}</span>
              {user?.department && (
                <span className="dashboard-userDept">🎓 {user.department}</span>
              )}
              {user?.studentId && (
                <span className="dashboard-userId">🆔 {user.studentId}</span>
              )}
            </div>
          </div>
        </div>
        <div className="dashboard-userActions">
          <button 
            onClick={() => setShowNotifications(true)}
            className="dashboard-notificationBtn"
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="dashboard-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
          <button onClick={logout} className="dashboard-logoutBtn">
            Logout
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-brandWrap">
          <span className="dashboard-brandIcon">🌿</span>
          <h1 className="dashboard-title">CampusHive</h1>
        </div>
        <p className="dashboard-welcome">Your campus community hub</p>
      </div>

      {showNotifications && (
        <Notifications onClose={() => {
          setShowNotifications(false);
          fetchUnreadCount();
        }} />
      )}

      <div className="dashboard-featuresGrid">
        {features.map((feature, index) => (
          <div
            key={index}
            className="dashboard-featureCard"
            onClick={() => navigate(feature.path)}
          >
            <div
              className="dashboard-featureIcon"
              style={{ backgroundColor: `${feature.color}20`, borderColor: feature.color }}
            >
              {feature.icon}
            </div>
            <h3 className="dashboard-featureTitle">{feature.title}</h3>
            <p className="dashboard-featureDesc">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
