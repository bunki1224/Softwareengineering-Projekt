import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Homepage from './Homepage';
import '../styles/TripDashboard.css';

const TripDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button 
          className="backlog-button"
          onClick={() => navigate(`/trips/${id}/backlog`)}
        >
          Manage Activities
        </button>
        <button 
          className="backlog-button"
          disabled
          style={{
            backgroundColor: '#666',
            cursor: 'not-allowed',
            marginLeft: '10px'
          }}
        >
          Export Trip
        </button>
      </div>
      <Homepage />
    </div>
  );
};

export default TripDashboard; 