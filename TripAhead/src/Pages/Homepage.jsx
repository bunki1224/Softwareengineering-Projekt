import './Homepage.css';
import { useState, useEffect } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  IconButton,
  Paper,
  styled
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import Activity from '../components/Activity';

const TimelineHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  backgroundColor: '#2c3446',
  borderBottom: '1px solid #424b64',
  gap: theme.spacing(2)
}));

const HeaderControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

const DayTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0
};

const defaultCenter = {
  lat: 35.6762,
  lng: 139.6503
};

const mapOptions = {
  styles: [
    {
      featureType: "all",
      elementType: "all",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#2c3446" }]
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#213243" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#424b64" }]
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#424b64" }]
    }
  ],
  disableDefaultUI: true,
  zoomControl: true,
  backgroundColor: 'transparent'
};

function Homepage() {
  const { id: tripId } = useParams();
  const [mapError, setMapError] = useState(null);
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ["places"]
  });

  const [selectedIdx, setSelectedIdx] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [activities, setActivities] = useState({ backlog: [], timeline: [] });
  const [dayTitles, setDayTitles] = useState({});
  const [maxDays, setMaxDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      setMapError('Google Maps API key is missing. Please add it to your .env file.');
    }
    fetchActivities();
  }, [tripId]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`http://localhost:3000/trips/${tripId}/activities`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const data = await response.json();
      
      // Transform the data into the format expected by the component
      const transformedData = {
        backlog: data.filter(a => a.status === 'backlog'),
        timeline: data.filter(a => a.status === 'timeline')
      };
      
      setActivities(transformedData);
      
      // Calculate max days based on activities
      const maxDay = Math.max(...transformedData.timeline.map(a => a.day || 0), 0);
      setMaxDays(Math.max(maxDay + 1, 7));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
      setLoading(false);
    }
  };

  const handleNextDay = () => {
    if (currentDay < maxDays - 1) {
      setCurrentDay(currentDay + 1);
    }
  };

  const handlePreviousDay = () => {
    if (currentDay > 0) {
      setCurrentDay(currentDay - 1);
    }
  };

  const dayActivities = activities.timeline.filter(activity => activity.day === currentDay);
  const currentDayTitle = dayTitles[currentDay] || `Day ${currentDay + 1}`;

  const handleMapLoad = (map) => {
    try {
      // Add any map initialization logic here
      console.log('Map loaded successfully');
    } catch (error) {
      console.error('Error loading map:', error);
      setMapError('Failed to load map');
    }
  };

  const handleMapError = (error) => {
    console.error('Map error:', error);
    setMapError('An error occurred while loading the map');
  };

  if (loading) {
    return (
      <div className="layout">
        <div className="loading">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layout">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="layout">
      <div className="leftPanel">
        <TimelineHeader>
          <HeaderControls>
            <IconButton
              onClick={handlePreviousDay}
              disabled={currentDay === 0}
              sx={{
                color: 'white',
                '&:hover': { color: '#4CAF50' },
                '&.Mui-disabled': { color: '#666' }
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <DayTitle>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {currentDayTitle}
              </Typography>
            </DayTitle>
            <IconButton
              onClick={handleNextDay}
              disabled={currentDay === maxDays - 1}
              sx={{
                color: 'white',
                '&:hover': { color: '#4CAF50' },
                '&.Mui-disabled': { color: '#666' }
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </HeaderControls>
        </TimelineHeader>
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: '#424b64'
        }}>
          {dayActivities.map((activity) => (
            <Activity
              key={activity.id}
              id={activity.id}
              title={activity.title}
              address={activity.address}
              price={activity.price}
              tags={activity.tags}
              rating={activity.rating}
              image={activity.image_url}
              selected={selectedIdx === activity.id}
              onClick={() => setSelectedIdx(activity.id)}
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
            <p>Sunny</p>
          </div>
        </div>
        <div className="mapPanel">
          {mapError ? (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              backgroundColor: '#2c3446',
              padding: '20px',
              textAlign: 'center'
            }}>
              {mapError}
            </div>
          ) : loadError ? (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              backgroundColor: '#2c3446'
            }}>
              Error loading maps
            </div>
          ) : !isLoaded ? (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              backgroundColor: '#2c3446'
            }}>
              Loading Maps...
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={selectedIdx ? activities.timeline.find(a => a.id === selectedIdx)?.position : defaultCenter}
              zoom={12}
              options={mapOptions}
              onLoad={handleMapLoad}
              onError={handleMapError}
            >
              {activities.timeline.map((activity) => (
                <Marker
                  key={activity.id}
                  position={{ 
                    lat: activity.position_lat || defaultCenter.lat, 
                    lng: activity.position_lng || defaultCenter.lng 
                  }}
                  onClick={() => setSelectedIdx(activity.id)}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;