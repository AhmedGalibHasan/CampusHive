import React from "react";
import './EventList.css';

function EventCard({ event, currentUserName, isAdmin, onRegister, onCancel, onDeleteEvent }) {
  const isAttending = event.attendeeNames?.includes(currentUserName);
  const isFull = event.capacity && event.attendees?.length >= event.capacity;

  return (
    <div className="card event-card">
      <h3>{event.title}</h3>
      <p className="muted">{event.description}</p>
      <p className="muted">
        Venue: <strong>{event.venue}</strong> • Capacity:{" "}
        <strong>{event.capacity || "Unlimited"}</strong>
      </p>
      <p className="muted">
        Time:{" "}
        {new Date(event.startTime).toLocaleString()} -{" "}
        {new Date(event.endTime).toLocaleString()}
      </p>
      <p className="muted">
        Creator: <strong>{event.creatorName}</strong> • Attendees:{" "}
        <strong>{event.attendeeNames?.length || 0}</strong>
      </p>
      <div className="card-actions">
        {isAdmin && (
          <button 
            className="danger-btn eventList-deleteBtn" 
            onClick={() => onDeleteEvent(event._id)}
          >
            Delete Event
          </button>
        )}
        {!isAdmin && (
          <>
            {isAttending ? (
              <button className="secondary-btn" onClick={() => onCancel(event._id)}>
                Cancel
              </button>
            ) : (
              <button
                className="primary-btn"
                onClick={() => onRegister(event._id)}
                disabled={isFull}
              >
                {isFull ? "Full" : "Register"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function EventList({
  events,
  currentUser,
  isAdmin,
  onRegister,
  onCancel,
  onDeleteEvent
}) {
  if (!events.length) {
    return <p className="muted">No events yet.</p>;
  }
  return (
    <div className="grid">
      {events.map((ev) => (
        <EventCard
          key={ev._id}
          event={ev}
          currentUserName={currentUser}
          isAdmin={isAdmin}
          onRegister={onRegister}
          onCancel={onCancel}
          onDeleteEvent={onDeleteEvent}
        />
      ))}
    </div>
  );
}
