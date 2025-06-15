import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTripModal from '../components/CreateTripModal';
import '../styles/Trips.css';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }
      const response = await fetch(`http://localhost:3000/trips/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (tripData) => {
    try {
      setLoading(true);
      setError(null);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const response = await fetch('http://localhost:3000/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tripData,
          user_id: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create trip');
      }

      setShowCreateModal(false);
      await fetchTrips();
    } catch (error) {
      console.error('Error creating trip:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTripClick = (tripId) => {
    navigate(`/trip/${tripId}`);
  };

  if (loading && trips.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="trips-container">
      <h1>My Trips</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <button 
        className="create-trip-btn"
        onClick={() => setShowCreateModal(true)}
        disabled={loading}
      >
        Create New Trip
      </button>

      <CreateTripModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTrip}
        loading={loading}
      />

      <div className="trips-list">
        {trips.length === 0 ? (
          <p className="no-trips">No trips yet. Create your first trip!</p>
        ) : (
          trips.map((trip) => (
            <div 
              key={trip.id} 
              className="trip-card"
              onClick={() => handleTripClick(trip.id)}
            >
              <h3>{trip.title}</h3>
              <p>{trip.description}</p>
              <div className="trip-dates">
                <span>Start: {new Date(trip.start_date).toLocaleDateString()}</span>
                <span>End: {new Date(trip.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Trips;