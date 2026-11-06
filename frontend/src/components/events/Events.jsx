import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import EventForm from './EventForm';
import EventList from './EventList';
import eventsService from '../../services/eventsService';
import './Events.css';

const Events = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await eventsService.createEvent(formData);
      setShowForm(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error?.message || 'Error creating event');
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await eventsService.registerForEvent(eventId);
      fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(error?.message || 'Error registering for event');
    }
  };

  const handleCancel = async (eventId) => {
    try {
      await eventsService.cancelRegistration(eventId);
      fetchEvents();
    } catch (error) {
      console.error('Error canceling registration:', error);
      alert(error?.message || 'Error canceling registration');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      await eventsService.deleteEvent(eventId);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(error?.message || 'Error deleting event');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="events-page">
      <div className="events-header">
        <div className="events-brandWrap">
          <span className="events-brandIcon">📅</span>
          <h2 className="events-brandTitle">Campus Events</h2>
        </div>
        <div className="events-headerActions">
          {isAdmin && (
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="events-createBtn"
            >
              {showForm ? 'Cancel' : '+ Create Event'}
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} className="events-backBtn">
            ← Dashboard
          </button>
        </div>
      </div>

      {showForm && (
        <div className="events-formContainer">
          <EventForm onCreate={handleCreate} />
        </div>
      )}

      <div className="events-eventsContainer">
        {loading ? (
          <div className="events-loading">Loading events...</div>
        ) : (
          <EventList
            events={events}
            currentUser={user?.name}
            isAdmin={isAdmin}
            onRegister={handleRegister}
            onCancel={handleCancel}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </div>
    </div>
  );
};

export default Events;

