import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import studyRoomService from '../../services/studyRoomService';
import StudyRoomForm from './StudyRoomForm';
import './StudyRoomDetail.css';

const StudyRoomDetail = () => {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [studyRoom, setStudyRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchStudyRoomData();
  }, [roomId]);

  useEffect(() => {
    if (!studyRoom || !user) return;
    
    const userId = getCurrentUserId();
    if (!userId) return;
    
    const memberCheck = studyRoom.members?.some(
      member => {
        const memberId = member._id || member;
        return memberId === userId || memberId?.toString() === userId?.toString();
      }
    );
    
    if (memberCheck) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [studyRoom?._id, roomId, user?._id, user?.id]);

  const fetchStudyRoomData = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await studyRoomService.getStudyRoomById(roomId);
      setStudyRoom(data);
    } catch (error) {
      setError(error.message || 'Failed to load study room data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    return user?.id || user?._id || null;
  };

  const isCreator = () => {
    if (!studyRoom || !user) return false;
    const userId = getCurrentUserId();
    return studyRoom.creator?._id === userId || studyRoom.creator?.toString() === userId?.toString();
  };

  const isMember = () => {
    if (!studyRoom || !user) return false;
    const userId = getCurrentUserId();
    return studyRoom.members?.some(
      member => member._id === userId || member?.toString() === userId?.toString()
    );
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await studyRoomService.joinStudyRoom(roomId);
      await fetchStudyRoomData();
      alert('Successfully joined the study room!');
    } catch (error) {
      alert(`Error joining room: ${error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this study room?')) {
      return;
    }
    setActionLoading(true);
    try {
      await studyRoomService.leaveStudyRoom(roomId);
      await fetchStudyRoomData();
      alert('Successfully left the study room!');
    } catch (error) {
      alert(`Error leaving room: ${error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisband = async () => {
    if (!confirm('Are you sure you want to disband this study room? This action cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    try {
      await studyRoomService.disbandStudyRoom(roomId);
      alert('Study room disbanded successfully!');
      navigate('/study-rooms');
    } catch (error) {
      alert(`Error disbanding room: ${error.message || 'Unknown error'}`);
      setActionLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!studyRoom || !user) return;
    
    const userId = getCurrentUserId();
    if (!userId) return;
    
    const memberCheck = studyRoom.members?.some(
      member => {
        const memberId = member._id || member;
        return memberId === userId || memberId?.toString() === userId?.toString();
      }
    );
    
    if (!memberCheck) return;
    
    try {
      const response = await studyRoomService.getMessages(roomId, { limit: 100 });
      setMessages(response.messages || []);
      // Scroll to bottom after messages load
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      // Messages are automatically marked as viewed when fetched (backend handles this)
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isMember()) return;

    try {
      await studyRoomService.sendMessage(roomId, newMessage);
      setNewMessage('');
      await fetchMessages();
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      alert(`Error sending message: ${error.message || 'Unknown error'}`);
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  if (loading) {
    return <div className="loading">Loading study room information...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!studyRoom) {
    return <div className="error">Study room not found</div>;
  }

  const occupancyCount = studyRoom.members?.length || 0;

  return (
    <div className="study-room-detail">
      <Link to="/study-rooms" className="back-link">
        ← Back to Study Rooms
      </Link>

      <div className="study-room-header">
        <div className="study-room-info-section">
          <div className="room-number-display">
            Room #{studyRoom.roomNumber}
          </div>
          <h1>{studyRoom.topic}</h1>
          <div className="study-room-meta">
            <div className="creator-info">
              Created by: <span className="creator-name">{studyRoom.creator?.name || 'Unknown'}</span>
            </div>
            <div className="occupancy-info">
              👥 {occupancyCount} {occupancyCount === 1 ? 'member' : 'members'}
            </div>
          </div>
          {studyRoom.location && (
            <div className="location-info">
              📍 Location: <span>{studyRoom.location}</span>
            </div>
          )}
          {studyRoom.socialMediaLink && (
            <div className="link-info">
              🔗 Virtual Session: <a href={studyRoom.socialMediaLink} target="_blank" rel="noopener noreferrer">{studyRoom.socialMediaLink}</a>
            </div>
          )}
        </div>
      </div>

      <div className="study-room-actions">
        {isCreator() ? (
          <button
            onClick={handleDisband}
            disabled={actionLoading}
            className="action-button disband-button"
          >
            {actionLoading ? 'Disbanding...' : 'Disband Room'}
          </button>
        ) : isMember() ? (
          <button
            onClick={handleLeave}
            disabled={actionLoading}
            className="action-button leave-button"
          >
            {actionLoading ? 'Leaving...' : 'Leave Room'}
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={actionLoading}
            className="action-button join-button"
          >
            {actionLoading ? 'Joining...' : 'Join Room'}
          </button>
        )}
      </div>

      <div className="members-section">
        <h2>Members ({occupancyCount})</h2>
        {occupancyCount === 0 ? (
          <div className="no-members">No members in this room yet.</div>
        ) : (
          <div className="members-list">
            {studyRoom.members?.map((member) => (
              <div key={member._id || member} className="member-item">
                <div className="member-avatar">
                  {member.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="member-info">
                  <div className="member-name">
                    {member.name || 'Unknown'}
                    {isCreator() && studyRoom.creator?._id === member._id && (
                      <span className="creator-badge">Creator</span>
                    )}
                  </div>
                  {member.email && (
                    <div className="member-email">{member.email}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isMember() && (
        <div className="messages-section">
          <h2>Messages</h2>
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">No messages yet. Start the conversation!</div>
            ) : (
              <div className="messages-list">
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender?._id === getCurrentUserId() || 
                                     msg.sender?.toString() === getCurrentUserId()?.toString();
                  return (
                    <div
                      key={msg._id}
                      className={`message-item ${isOwnMessage ? 'own-message' : ''}`}
                    >
                      <div className="message-sender">
                        {msg.sender?.name || 'Unknown'}
                      </div>
                      <div className="message-content">{msg.message}</div>
                      <div className="message-time">
                        {formatMessageTime(msg.createdAt)}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="message-input"
            />
            <button type="submit" className="send-message-button">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudyRoomDetail;

