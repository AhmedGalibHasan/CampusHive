import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ClubForm from './ClubForm';
import ClubList from './ClubList';
import ClubSearchFilter from './ClubSearchFilter';
import clubsService from '../../services/clubsService';
import './Clubs.css';

const Clubs = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchClubs();
  }, [searchTerm, filter, category]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const data = await clubsService.getClubs({
        searchTerm,
        filter,
        category,
        userId: user?.id,
      });
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await clubsService.requestClub(formData);
      setShowForm(false);
      fetchClubs();
    } catch (error) {
      console.error('Error creating club:', error);
      alert(error?.message || 'Error creating club');
    }
  };

  const handleJoin = async (clubId) => {
    try {
      await clubsService.joinClub(clubId);
      fetchClubs();
    } catch (error) {
      console.error('Error joining club:', error);
      alert(error?.message || 'Error joining club');
    }
  };

  const handleLeave = async (clubId) => {
    try {
      await clubsService.leaveClub(clubId);
      fetchClubs();
    } catch (error) {
      console.error('Error leaving club:', error);
      alert(error?.message || 'Error leaving club');
    }
  };

  const handleAddAnnouncement = async (clubId, content) => {
    try {
      await clubsService.addAnnouncement(clubId, content);
      fetchClubs();
    } catch (error) {
      console.error('Error adding announcement:', error);
      alert(error?.message || 'Error adding announcement');
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Are you sure you want to delete this club?')) {
      return;
    }
    try {
      await clubsService.deleteClub(clubId);
      fetchClubs();
    } catch (error) {
      console.error('Error deleting club:', error);
      alert(error?.message || 'Error deleting club');
    }
  };

  const handleApproveAnnouncement = async (clubId, announcementIndex) => {
    try {
      await clubsService.approveAnnouncement(clubId, announcementIndex);
      fetchClubs();
    } catch (error) {
      console.error('Error approving announcement:', error);
      alert(error?.message || 'Error approving announcement');
    }
  };

  const handleRejectAnnouncement = async (clubId, announcementIndex) => {
    try {
      await clubsService.rejectAnnouncement(clubId, announcementIndex);
      fetchClubs();
    } catch (error) {
      console.error('Error rejecting announcement:', error);
      alert(error?.message || 'Error rejecting announcement');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="clubs-page">
      <div className="clubs-header">
        <div className="clubs-brandWrap">
          <span className="clubs-brandIcon">🎯</span>
          <h2 className="clubs-brandTitle">Campus Clubs</h2>
        </div>
        <div className="clubs-headerActions">
          {isAdmin && (
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="clubs-createBtn"
            >
              {showForm ? 'Cancel' : '+ Create Club'}
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} className="clubs-backBtn">
            ← Dashboard
          </button>
        </div>
      </div>

      {showForm && (
        <div className="clubs-formContainer">
          <ClubForm onCreate={handleCreate} />
        </div>
      )}

      <div className="clubs-searchFilterContainer">
        <ClubSearchFilter
          onSearch={setSearchTerm}
          onFilter={setFilter}
          onCategoryChange={setCategory}
          currentFilter={filter}
          currentCategory={category}
          currentSearch={searchTerm}
        />
      </div>

      <div className="clubs-clubsContainer">
        {loading ? (
          <div className="clubs-loading">Loading clubs...</div>
        ) : (
          <ClubList
            clubs={clubs}
            currentUser={user?.name}
            isAdmin={isAdmin}
            onJoin={handleJoin}
            onLeave={handleLeave}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteClub={handleDeleteClub}
            onApproveAnnouncement={handleApproveAnnouncement}
            onRejectAnnouncement={handleRejectAnnouncement}
          />
        )}
      </div>
    </div>
  );
};

export default Clubs;

