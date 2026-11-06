import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import rideBuddyService from '../../services/rideBuddyService';
import './RideBuddy.css';

const RideBuddy = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    fromLocation: '',
    toLocation: '',
    vehicleType: '',
    status: ''
  });
  const [formData, setFormData] = useState({
    vehicleType: 'bike',
    maxCapacity: 1,
    fromLocation: '',
    toLocation: '',
    rideDate: '',
    rideTime: '',
    description: '',
    contactInfo: ''
  });

  useEffect(() => {
    fetchRides();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchRides();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchFilters]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const nextRides = await rideBuddyService.getRides(searchFilters);
      setRides(nextRides);
    } catch (error) {
      console.error('Error fetching rides:', error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-set maxCapacity based on vehicle type
      if (name === 'vehicleType') {
        newData.maxCapacity = value === 'bike' ? 1 : 5;
      }
      return newData;
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await rideBuddyService.createRide(formData);
      setFormData({
        vehicleType: 'bike',
        maxCapacity: 1,
        fromLocation: '',
        toLocation: '',
        rideDate: '',
        rideTime: '',
        description: '',
        contactInfo: ''
      });
      setShowForm(false);
      fetchRides();
    } catch (error) {
      console.error('Error creating ride:', error);
      alert(error?.message || (typeof error === 'string' ? error : 'Error creating ride'));
    }
  };

  const handlePairRequest = async (rideId) => {
    try {
      await rideBuddyService.sendPairRequest(rideId);
      fetchRides();
      alert('Pair request sent!');
    } catch (error) {
      console.error('Error sending pair request:', error);
      alert(error?.message || (typeof error === 'string' ? error : 'Error sending request'));
    }
  };

  const handleRequestResponse = async (rideId, requestUserId, status) => {
    try {
      await rideBuddyService.respondToPairRequest(rideId, { requestUserId, status });
      fetchRides();
    } catch (error) {
      console.error('Error updating request:', error);
      alert(error?.message || (typeof error === 'string' ? error : 'Error updating request'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#4CAF50';
      case 'full': return '#f44336';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#FF5722';
      default: return '#2196F3';
    }
  };

  const isUserRequested = (ride) => {
    if (!user || !ride.pairRequests) return false;
    const userId = user.id || user._id;
    return ride.pairRequests.some(req => {
      const reqUserId = req.user?._id || req.user?.id;
      return reqUserId && (reqUserId.toString() === userId?.toString() || reqUserId === userId) && req.status === 'pending';
    });
  };

  const isUserAccepted = (ride) => {
    if (!user || !ride.pairRequests) return false;
    const userId = user.id || user._id;
    return ride.pairRequests.some(req => {
      const reqUserId = req.user?._id || req.user?.id;
      return reqUserId && (reqUserId.toString() === userId?.toString() || reqUserId === userId) && req.status === 'accepted';
    });
  };

  const isOwner = (ride) => {
    if (!user || !ride.user) return false;
    const userId = user.id || user._id;
    const rideUserId = ride.user._id || ride.user.id;
    return rideUserId && (rideUserId.toString() === userId?.toString() || rideUserId === userId);
  };

  if (loading) {
    return (
      <div className="rideBuddy-page">
        <div className="rideBuddy-loading">Loading rides...</div>
      </div>
    );
  }

  return (
    <div className="rideBuddy-page">
      <div className="rideBuddy-header">
        <div className="rideBuddy-brandWrap">
          <span className="rideBuddy-brandIcon">🚗</span>
          <h2 className="rideBuddy-brandTitle">Ride Buddy</h2>
        </div>
        <button onClick={() => navigate('/dashboard')} className="rideBuddy-backBtn">
          ← Dashboard
        </button>
      </div>

      {/* Search Filters */}
      <div className="rideBuddy-searchContainer">
        <div className="rideBuddy-searchRow">
          <input
            type="text"
            name="fromLocation"
            placeholder="From location..."
            value={searchFilters.fromLocation}
            onChange={handleFilterChange}
            className="rideBuddy-searchInput"
          />
          <input
            type="text"
            name="toLocation"
            placeholder="To location..."
            value={searchFilters.toLocation}
            onChange={handleFilterChange}
            className="rideBuddy-searchInput"
          />
          <select
            name="vehicleType"
            value={searchFilters.vehicleType}
            onChange={handleFilterChange}
            className="rideBuddy-filterSelect"
          >
            <option value="">All Vehicles</option>
            <option value="bike">Bike</option>
            <option value="car">Car</option>
          </select>
          <select
            name="status"
            value={searchFilters.status}
            onChange={handleFilterChange}
            className="rideBuddy-filterSelect"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>

      <button 
        onClick={() => setShowForm(!showForm)} 
        className="rideBuddy-createBtn"
      >
        {showForm ? '✕ Cancel' : '+ Create Ride Post'}
      </button>

      {showForm && (
        <div className="rideBuddy-formContainer">
          <h3 className="rideBuddy-formTitle">Post a Ride Share</h3>
          <form onSubmit={handleSubmit} className="rideBuddy-form">
            <div className="rideBuddy-formRow">
              <div className="rideBuddy-formGroup">
                <label className="rideBuddy-label">Vehicle Type *</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                  className="rideBuddy-input"
                >
                  <option value="bike">Bike (1 person)</option>
                  <option value="car">Car (up to 5 people)</option>
                </select>
              </div>
              {formData.vehicleType === 'car' && (
                <div className="rideBuddy-formGroup">
                  <label className="rideBuddy-label">Max Capacity (1-5) *</label>
                  <input
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    min="1"
                    max="5"
                    required
                    className="rideBuddy-input"
                  />
                </div>
              )}
            </div>
            <div className="rideBuddy-formRow">
              <div className="rideBuddy-formGroup">
                <label className="rideBuddy-label">From Location *</label>
                <input
                  type="text"
                  name="fromLocation"
                  placeholder="Starting point"
                  value={formData.fromLocation}
                  onChange={handleChange}
                  required
                  className="rideBuddy-input"
                />
              </div>
              <div className="rideBuddy-formGroup">
                <label className="rideBuddy-label">To Location *</label>
                <input
                  type="text"
                  name="toLocation"
                  placeholder="Destination"
                  value={formData.toLocation}
                  onChange={handleChange}
                  required
                  className="rideBuddy-input"
                />
              </div>
            </div>
            <div className="rideBuddy-formRow">
              <div className="rideBuddy-formGroup">
                <label className="rideBuddy-label">Date *</label>
                <input
                  type="date"
                  name="rideDate"
                  value={formData.rideDate}
                  onChange={handleChange}
                  required
                  className="rideBuddy-input"
                />
              </div>
              <div className="rideBuddy-formGroup">
                <label className="rideBuddy-label">Time *</label>
                <input
                  type="time"
                  name="rideTime"
                  value={formData.rideTime}
                  onChange={handleChange}
                  required
                  className="rideBuddy-input"
                />
              </div>
            </div>
            <div className="rideBuddy-formGroup">
              <label className="rideBuddy-label">Description</label>
              <textarea
                name="description"
                placeholder="Additional details about the ride..."
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="rideBuddy-textarea"
              />
            </div>
            <div className="rideBuddy-formGroup">
              <label className="rideBuddy-label">Contact Info</label>
              <input
                type="text"
                name="contactInfo"
                placeholder="Phone, WhatsApp, etc."
                value={formData.contactInfo}
                onChange={handleChange}
                className="rideBuddy-input"
              />
            </div>
            <button type="submit" className="rideBuddy-submitBtn">Post Ride</button>
          </form>
        </div>
      )}

      <div className="rideBuddy-ridesContainer">
        <h3 className="rideBuddy-sectionTitle">Available Rides</h3>
        {rides.length === 0 ? (
          <div className="rideBuddy-emptyState">
            <span className="rideBuddy-emptyIcon">🚗</span>
            <p className="rideBuddy-emptyText">No rides available. Create one!</p>
          </div>
        ) : (
          rides.map(ride => {
            if (!ride || !ride.user) return null;
            
            const isFull = ride.isFull || ride.status === 'full';
            const userRequested = isUserRequested(ride);
            const userAccepted = isUserAccepted(ride);
            const userIsOwner = isOwner(ride);

            return (
              <div key={ride._id} className="rideBuddy-rideCard">
                <div className="rideBuddy-rideHeader">
                  <div className="rideBuddy-rideOwner">
                    <span className="rideBuddy-ownerAvatar">
                      {(ride.user?.name || 'U').slice(0,1).toUpperCase()}
                    </span>
                    <div>
                      <strong className="rideBuddy-ownerName">{ride.user?.name || 'Unknown'}</strong>
                      <div className="rideBuddy-ownerContact">
                        {ride.contactInfo || ride.user?.phone || 'Contact via app'}
                      </div>
                    </div>
                  </div>
                  <div className="rideBuddy-rideMeta">
                    <span
                      className="rideBuddy-statusBadge"
                      style={{ backgroundColor: getStatusColor(ride.status || 'open') }}
                    >
                      {(ride.status || 'open').toUpperCase()}
                    </span>
                    <span className="rideBuddy-vehicleBadge">
                      {ride.vehicleType === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                    </span>
                  </div>
                </div>

                <div className="rideBuddy-rideDetails">
                  <div className="rideBuddy-route">
                    <div className="rideBuddy-location">
                      <span className="rideBuddy-locationIcon">📍</span>
                      <strong>{ride.fromLocation}</strong>
                    </div>
                    <div className="rideBuddy-arrow">↓</div>
                    <div className="rideBuddy-location">
                      <span className="rideBuddy-locationIcon">🎯</span>
                      <strong>{ride.toLocation}</strong>
                    </div>
                  </div>
                  <div className="rideBuddy-timeInfo">
                    <span>📅 {new Date(ride.rideDate).toLocaleDateString()}</span>
                    <span>🕐 {ride.rideTime}</span>
                  </div>
                  {ride.description && (
                    <div className="rideBuddy-description">{ride.description}</div>
                  )}
                </div>

                <div className="rideBuddy-capacityInfo">
                  <div className="rideBuddy-capacityBar">
                    <div className="rideBuddy-capacityLabel">
                      Capacity: {ride.acceptedCount || 0} / {ride.maxCapacity || 1}
                    </div>
                    <div className="rideBuddy-capacityProgress">
                      <div 
                        className="rideBuddy-capacityFill"
                        style={{
                          width: `${((ride.acceptedCount || 0) / (ride.maxCapacity || 1)) * 100}%`,
                          backgroundColor: isFull ? '#f44336' : '#4CAF50'
                        }}
                      />
                    </div>
                  </div>
                  {isFull && (
                    <div className="rideBuddy-fullBadge">FULL</div>
                  )}
                </div>

                {/* Action Buttons */}
                {!userIsOwner && (
                  <div className="rideBuddy-actionSection">
                    {userAccepted ? (
                      <div className="rideBuddy-acceptedBadge">✓ You're in this ride!</div>
                    ) : userRequested ? (
                      <div className="rideBuddy-pendingBadge">⏳ Request Pending</div>
                    ) : (
                      <button 
                        onClick={() => handlePairRequest(ride._id)}
                        className={`rideBuddy-pairBtn ${isFull ? 'rideBuddy-pairBtn--disabled' : ''}`}
                        disabled={isFull}
                      >
                        {isFull ? 'Ride Full' : 'Send Pair Request'}
                      </button>
                    )}
                  </div>
                )}

                {/* Owner's Request Management */}
                {userIsOwner && ride.pairRequests && ride.pairRequests.length > 0 && (
                  <div className="rideBuddy-requestsContainer">
                    <h4 className="rideBuddy-requestsTitle">
                      Pair Requests ({ride.pairRequests.filter(r => r.status === 'pending').length} pending)
                    </h4>
                    <div className="rideBuddy-requestsList">
                      {ride.pairRequests.map((request, index) => {
                        if (!request || !request.user) return null;
                        return (
                          <div key={request.user._id || request.user.id || index} className="rideBuddy-requestCard">
                            <div className="rideBuddy-requestUser">
                              <span className="rideBuddy-requestAvatar">
                                {(request.user?.name || 'U').slice(0,1).toUpperCase()}
                              </span>
                              <div>
                                <strong>{request.user?.name || 'Unknown'}</strong>
                                <div className="rideBuddy-requestContact">
                                  {request.user?.phone || 'No contact'}
                                </div>
                                <span
                                  className="rideBuddy-requestStatus"
                                  style={{
                                    color: request.status === 'accepted'
                                      ? '#4CAF50'
                                      : request.status === 'rejected'
                                        ? '#f44336'
                                        : '#FF9800'
                                  }}
                                >
                                  {request.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            {request.status === 'pending' && !isFull && (
                              <div className="rideBuddy-requestBtns">
                                <button 
                                  onClick={() => handleRequestResponse(ride._id, request.user._id || request.user.id, 'accepted')}
                                  className="rideBuddy-acceptBtn"
                                >
                                  ✓ Accept
                                </button>
                                <button 
                                  onClick={() => handleRequestResponse(ride._id, request.user._id || request.user.id, 'rejected')}
                                  className="rideBuddy-rejectBtn"
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            )}
                            {request.status === 'pending' && isFull && (
                              <div className="rideBuddy-fullMessage">Ride is full</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RideBuddy;
