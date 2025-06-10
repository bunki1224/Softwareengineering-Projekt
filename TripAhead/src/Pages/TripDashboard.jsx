import React from 'react';
import { useParams } from 'react-router-dom';
import Homepage from './Homepage';
import '../styles/TripDashboard.css';

const TripDashboard = () => {
  const { id } = useParams();

  return (
    <div className="dashboard-container">
      <Homepage />
    </div>
  );
};

export default TripDashboard; 