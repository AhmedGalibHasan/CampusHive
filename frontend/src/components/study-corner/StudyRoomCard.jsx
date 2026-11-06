import React from 'react';
import { Link } from 'react-router-dom';
import './StudyRoomCard.css';

const StudyRoomCard = ({ studyRoom }) => {
  const occupancyCount = studyRoom.members?.length || 0;
  const messageCount = studyRoom.messageCount || 0;
  const showNotification = messageCount > 0;

  return (
    <Link
      to={`/study-rooms/${studyRoom._id}`}
      className="study-room-card"
    >
      <div className="study-room-header">
        <div className="room-number-badge">
          Room #{studyRoom.roomNumber}
          {showNotification && (
            <span className="message-notification-badge" title={`${messageCount} message${messageCount !== 1 ? 's' : ''}`}>
              {messageCount > 99 ? '99+' : messageCount}
            </span>
          )}
        </div>
        <div className="occupancy-count">
          👥 {occupancyCount} {occupancyCount === 1 ? 'member' : 'members'}
        </div>
      </div>
      
      <div className="study-room-content">
        <h3 className="study-room-topic">{studyRoom.topic}</h3>
        <div className="study-room-creator">
          Created by: <span className="creator-name">{studyRoom.creator?.name || 'Unknown'}</span>
        </div>
        {studyRoom.location && (
          <div className="study-room-location">
            📍 {studyRoom.location}
          </div>
        )}
        {studyRoom.socialMediaLink && (
          <div className="study-room-link">
            🔗 Virtual Session
          </div>
        )}
      </div>
    </Link>
  );
};

export default StudyRoomCard;

