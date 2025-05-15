import './Homepage.css';
import { useState, useEffect } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
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

function Homepage() {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_Map_Api_Key,
    libraries: ["places"]
  });
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [activities, setActivities] = useState({ backlog: [], timeline: [] });
  const [dayTitles, setDayTitles] = useState({});
  const [maxDays, setMaxDays] = useState(7);

  // Force reload when component mounts
  useEffect(() => {
    const savedActivities = JSON.parse(localStorage.getItem('activities')) || { backlog: [], timeline: [] };
    const savedDayTitles = JSON.parse(localStorage.getItem('dayTitles')) || {};
    setActivities(savedActivities);
    setDayTitles(savedDayTitles);
    
    // Calculate max days based on activities
    const maxDay = Math.max(...savedActivities.timeline.map(a => a.day || 0), 0);
    setMaxDays(Math.max(maxDay + 1, 7));
  }, [navigate]); // This will run every time we navigate to the homepage

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedActivities = JSON.parse(localStorage.getItem('activities')) || { backlog: [], timeline: [] };
      const savedDayTitles = JSON.parse(localStorage.getItem('dayTitles')) || {};
      setActivities(savedActivities);
      setDayTitles(savedDayTitles);
      
      // Calculate max days based on activities
      const maxDay = Math.max(...savedActivities.timeline.map(a => a.day || 0), 0);
      setMaxDays(Math.max(maxDay + 1, 7));
    };

    // Set up interval to check for changes
    const intervalId = setInterval(handleStorageChange, 1000);

    // Also listen for storage events (for cross-tab updates)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

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

  // Filter activities for current day
  const dayActivities = activities.timeline.filter(activity => activity.day === currentDay);
  const currentDayTitle = dayTitles[currentDay] || `Day ${currentDay + 1}`;

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
              image={activity.image}
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
          {loadError ? (
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
              mapContainerClassName="mapContainer"
              center={selectedIdx ? activities.timeline.find(a => a.id === selectedIdx)?.position : { lat: 35.6762, lng: 139.6503 }}
              zoom={12}
              options={{
                styles: [
                  {
                    featureType: "all",
                    elementType: "all",
                    stylers: [{ color: "#2c3446" }]
                  }
                ]
              }}
            >
              {activities.timeline.map((activity) => (
                <Marker
                  key={activity.id}
                  position={activity.position}
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