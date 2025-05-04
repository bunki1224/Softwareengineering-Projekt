import './Homepage.css';
import Activity from '../Activity';
import { useState } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const dummyActivities = [
  {
    name: 'Tokyo Skytree',
    address: '1-chōme-1-2 Oshiage, Sumida City, Tokyo',
    price: '20 €',
    type: 'Sightseeing',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    position: { lat: 35.710063, lng: 139.8107 }
  },
  {
    name: 'Meiji Shrine',
    address: '1-1 Yoyogikamizonocho, Shibuya City, Tokyo',
    price: 'Free',
    type: 'Temple',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    position: { lat: 35.6764, lng: 139.6993 }
  },
  {
    name: 'Ichiran Shibuya',
    address: 'Shibuya City, Jinnan, 1 Chome-22-7',
    price: '€€',
    type: 'Food',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    position: { lat: 35.6595, lng: 139.7005 }
  },
  {
    name: 'Red Roof Inn Kamata',
    address: '7 Chome-24-7 Nishikamata, Ota City, Tokyo',
    price: '200 €',
    type: 'Hotel',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    position: { lat: 35.5613, lng: 139.716 }
  }
];

function Homepage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_Map_Api_Key
  });
  const [selectedIdx, setSelectedIdx] = useState(null);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  return (
    <div className="layout">
      <div className="leftPanel">
        <input type="text" placeholder="Search activities..." className="searchBar" />
        <div className="activity-list">
          {dummyActivities.map((activity, idx) => (
            <Activity
              key={idx}
              {...activity}
              selected={selectedIdx === idx}
              onClick={() => setSelectedIdx(idx)}
            />
          ))}
        </div>
      </div>
      <div className="rightPanel">
        <div className="topPanel">
          <div className="box">
            <h3>Budget</h3>
            <p>60%</p>
          </div>
          <div className="box">
            <h3>Time to trip</h3>
            <p>180 Days</p>
          </div>
          <div className="box">
            <h3>Weather</h3>
            <p>10°C Rainy</p>
          </div>
        </div>
        <div className="mapPanel">
          <GoogleMap
            mapContainerClassName="mapContainer"
            center={selectedIdx !== null ? dummyActivities[selectedIdx].position : { lat: 35.6895, lng: 139.6917 }}
            zoom={12}
          >
            {dummyActivities.map((activity, idx) => (
              <Marker
                key={idx}
                position={activity.position}
                label={activity.name[0]}
                icon={selectedIdx === idx ? {
                  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                } : undefined}
                onClick={() => setSelectedIdx(idx)}
              />
            ))}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}

export default Homepage;