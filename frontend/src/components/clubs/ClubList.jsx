import React, { useState } from "react";
import './ClubList.css';

function ClubCard({ 
  club, 
  currentUserName, 
  isAdmin,
  onJoin, 
  onLeave, 
  onAddAnnouncement,
  onDeleteClub,
  onApproveAnnouncement,
  onRejectAnnouncement
}) {
  const isMember = club.memberNames?.includes(currentUserName);
  const [announcement, setAnnouncement] = useState("");

  const handleAdd = () => {
    if (!announcement.trim()) return;
    onAddAnnouncement(club._id, announcement.trim());
    setAnnouncement("");
  };

  return (
    <div className="card club-card">
      {/* CLUB HEADER WITH LOGO AND NAME */}
      <div className="club-header">
        {club.logo && (
          <img
            src={`http://localhost:5000${club.logo}`}
            alt="club logo"
            className="club-logo-small"
          />
        )}
        <h3 className="club-name">{club.name}</h3>
      </div>
      <p className="muted">{club.description}</p>

      <p className="muted">
        Creator: <strong>{club.creatorName}</strong> • Members:{" "}
        <strong>{club.memberNames?.length || 0}</strong>
      </p>
      
      {/* CATEGORY BADGE */}
      <div className="club-category">
        <span className={`category-badge category-${club.category || 'other'}`}>
          {club.category === 'sports' && '⚽'}
          {club.category === 'cultural' && '🎭'}
          {club.category === 'academic' && '📚'}
          {club.category === 'other' && '🏢'}
          {' '}
          {club.category ? club.category.charAt(0).toUpperCase() + club.category.slice(1) : 'Other'}
        </span>
      </div>

      {/* JOIN / LEAVE BUTTONS */}
      <div className="card-actions">
        {isAdmin && (
          <button 
            className="danger-btn clubList-deleteBtn" 
            onClick={() => onDeleteClub(club._id)}
          >
            Delete Club
          </button>
        )}
        {!isAdmin && (
          <>
            {isMember ? (
              <button className="secondary-btn" onClick={() => onLeave(club._id)}>
                Leave
              </button>
            ) : (
              <button className="primary-btn" onClick={() => onJoin(club._id)}>
                Join
              </button>
            )}
          </>
        )}
      </div>

      {/* ANNOUNCEMENTS */}
      <div className="announcement-section">
        <h4>Announcements</h4>

        {club.announcements && club.announcements.length > 0 ? (
          <ul className="announcement-list">
            {club.announcements.map((a, idx) => {
              const isPending = a.status === 'pending';
              const isApproved = a.status === 'approved';
              const statusClass = isPending
                ? 'announcement-item--pending'
                : isApproved
                  ? 'announcement-item--approved'
                  : 'announcement-item--rejected';
              
              return (
                <li 
                  key={idx} 
                  className={`announcement-item ${statusClass}`}
                >
                  <div className="announcement-header">
                    <span className="announcement-author">{a.authorName}</span>
                    <div className="announcement-meta">
                      {isPending && <span className="announcement-status announcement-status--pending">PENDING</span>}
                      {isApproved && <span className="announcement-status announcement-status--approved">APPROVED</span>}
                      {a.status === 'rejected' && <span className="announcement-status announcement-status--rejected">REJECTED</span>}
                      <span className="announcement-date">
                        {new Date(a.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p>{a.content}</p>
                  {isAdmin && isPending && (
                    <div className="announcement-actions">
                      <button 
                        className="primary-btn announcement-actionBtn"
                        onClick={() => onApproveAnnouncement(club._id, idx)}
                      >
                        Approve
                      </button>
                      <button 
                        className="danger-btn announcement-actionBtn"
                        onClick={() => onRejectAnnouncement(club._id, idx)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted small">No announcements yet</p>
        )}

        {/* ADD ANNOUNCEMENT */}
        {isMember && !isAdmin && (
          <div className="announcement-form">
            <input
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Post an announcement (pending approval)"
            />
            <button className="secondary-btn" type="button" onClick={handleAdd}>
              Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClubList({
  clubs,
  currentUser,
  isAdmin,
  onJoin,
  onLeave,
  onAddAnnouncement,
  onDeleteClub,
  onApproveAnnouncement,
  onRejectAnnouncement
}) {
  if (!clubs.length) {
    return <p className="muted">No clubs yet.</p>;
  }

  return (
    <div className="grid">
      {clubs.map((club) => (
        <ClubCard
          key={club._id}
          club={club}
          currentUserName={currentUser}
          isAdmin={isAdmin}
          onJoin={onJoin}
          onLeave={onLeave}
          onAddAnnouncement={onAddAnnouncement}
          onDeleteClub={onDeleteClub}
          onApproveAnnouncement={onApproveAnnouncement}
          onRejectAnnouncement={onRejectAnnouncement}
        />
      ))}
    </div>
  );
}
