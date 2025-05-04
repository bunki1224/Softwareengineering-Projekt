// TripAhead/src/Activity.jsx
import React from 'react';
import './Activity.css';

function Activity({ name, address, type, price, rating, image, onClick, selected }) {
  return (
    <div className={`activity-card${selected ? ' selected' : ''}`} onClick={onClick}>
      <img src={image} alt={name} className="activity-image" />
      <div className="activity-info">
        <h3>{name}</h3>
        <p className="activity-address">{address}</p>
        <div className="activity-tags">
          <span className="activity-type">{type}</span>
          <span className="activity-price">{price}</span>
        </div>
        <div className="activity-rating">{'⭐'.repeat(rating)}</div>
      </div>
    </div>
  );
}

export default Activity;