import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import TimelineView from '../components/TimelineView';
import '../styles/Trips.css';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newTrip, setNewTrip] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  });
  const [currentDay, setCurrentDay] = useState(0);
  const [maxDays, setMaxDays] = useState(7);
  const [dayTitles, setDayTitles] = useState({});
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

  const handleCreateTrip = async (e) => {
    e.preventDefault();
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
          ...newTrip,
          user_id: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create trip');
      }

      setShowCreateForm(false);
      setNewTrip({
        title: '',
        description: '',
        start_date: '',
        end_date: ''
      });
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

  const handleAddDay = () => {
    if (maxDays < 14) {
      setMaxDays(prev => prev + 1);
      setCurrentDay(maxDays);
    }
  };

  const handleRemoveDay = (dayToRemove) => {
    setMaxDays(prev => prev - 1);
    if (currentDay === dayToRemove) {
      setCurrentDay(prev => prev - 1);
    }
  };

  const handleUpdateDayTitle = (day, title) => {
    setDayTitles(prev => ({
      ...prev,
      [day]: title
    }));
  };

  if (loading) {
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
        onClick={() => setShowCreateForm(true)}
        disabled={loading}
      >
        Create New Trip
      </button>

      {showCreateForm && (
        <div className="create-trip-form">
          <h2>Create New Trip</h2>
          <form onSubmit={handleCreateTrip}>
            <input
              type="text"
              placeholder="Trip Title"
              value={newTrip.title}
              onChange={(e) => setNewTrip({...newTrip, title: e.target.value})}
              required
              disabled={loading}
            />
            <textarea
              placeholder="Description"
              value={newTrip.description}
              onChange={(e) => setNewTrip({...newTrip, description: e.target.value})}
              disabled={loading}
            />
            <input
              type="date"
              value={newTrip.start_date}
              onChange={(e) => setNewTrip({...newTrip, start_date: e.target.value})}
              disabled={loading}
            />
            <input
              type="date"
              value={newTrip.end_date}
              onChange={(e) => setNewTrip({...newTrip, end_date: e.target.value})}
              disabled={loading}
            />
            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DragDropContext onDragEnd={() => {}}>
        <div className="trips-timeline">
          <TimelineView
            activities={trips}
            currentDay={currentDay}
            onDayChange={setCurrentDay}
            maxDays={maxDays}
            onAddDay={handleAddDay}
            onRemoveDay={handleRemoveDay}
            dayTitles={dayTitles}
            onUpdateDayTitle={handleUpdateDayTitle}
          />
        </div>
      </DragDropContext>
    </div>
  );
};

export default Trips;