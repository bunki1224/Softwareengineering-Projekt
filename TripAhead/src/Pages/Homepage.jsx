import './Homepage.css';
import { useState, useEffect, useCallback } from 'react';
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
  left: 0,
  borderRadius: '18px'
};

// Default center for Tokyo (will be overridden if activities exist)
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
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  
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

  // Add Marl marker to state
  const [marlMarker] = useState({
    position: { lat: 51.6557, lng: 7.0904 },
    title: "Marl",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 8,
    }
  });

  // Function to calculate the center point of all activities
  const calculateMapCenter = (activities) => {
    const allActivities = [...activities.timeline, ...activities.backlog];
    const validActivities = allActivities.filter(a => a.position_lat && a.position_lng);
    
    if (validActivities.length === 0) {
      return defaultCenter;
    }

    const sumLat = validActivities.reduce((sum, activity) => sum + parseFloat(activity.position_lat), 0);
    const sumLng = validActivities.reduce((sum, activity) => sum + parseFloat(activity.position_lng), 0);
    
    return {
      lat: sumLat / validActivities.length,
      lng: sumLng / validActivities.length
    };
  };

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
      console.log('Raw activities data:', data);
      
      // Transform the data into the format expected by the component
      const transformedData = {
        backlog: data.filter(a => a.status === 'backlog'),
        timeline: data.filter(a => a.status === 'timeline')
      };
      
      console.log('Transformed activities:', transformedData);
      console.log('Timeline activities:', transformedData.timeline);
      console.log('Backlog activities:', transformedData.backlog);
      
      // Log coordinates for each activity
      transformedData.timeline.forEach(activity => {
        console.log(`Timeline activity ${activity.id} coordinates:`, {
          lat: activity.position_lat,
          lng: activity.position_lng
        });
      });
      
      transformedData.backlog.forEach(activity => {
        console.log(`Backlog activity ${activity.id} coordinates:`, {
          lat: activity.position_lat,
          lng: activity.position_lng
        });
      });
      
      setActivities(transformedData);
      
      // Calculate and set the map center based on activities
      const center = calculateMapCenter(transformedData);
      console.log('Calculated map center:', center);
      setMapCenter(center);
      
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

  const dayActivities = activities.timeline.filter(activity => activity.day === currentDay + 1);
  const currentDayTitle = dayTitles[currentDay] || `Day ${currentDay + 1}`;

  // Add state for map instance
  const [mapInstance, setMapInstance] = useState(null);

  // Function to update activity markers
  const updateActivityMarkers = useCallback(() => {
    if (!mapInstance) return;

    // Clear existing activity markers
    if (window.activityMarkers) {
      window.activityMarkers.forEach(marker => marker.setMap(null));
    }
    window.activityMarkers = [];

    // Create bounds object
    const bounds = new google.maps.LatLngBounds();

    // Add markers for current day's activities
    dayActivities.forEach(activity => {
      if (activity.position_lat && activity.position_lng) {
        const position = {
          lat: parseFloat(activity.position_lat),
          lng: parseFloat(activity.position_lng)
        };
        
        const marker = new google.maps.Marker({
          position: position,
          map: mapInstance,
          title: activity.title,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(32, 32)
          }
        });
        window.activityMarkers.push(marker);
        
        // Extend bounds to include this marker
        bounds.extend(position);
      }
    });

    // If we have markers, fit the map to show all of them
    if (window.activityMarkers.length > 0) {
      mapInstance.fitBounds(bounds);
      
      // Add some padding to the bounds
      const listener = google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
        if (mapInstance.getZoom() > 15) {
          mapInstance.setZoom(15);
        }
      });
    }
  }, [mapInstance, dayActivities]);

  // Update markers when day changes or activities change
  useEffect(() => {
    updateActivityMarkers();
  }, [currentDay, activities, updateActivityMarkers]);

  const handleMapLoad = (map) => {
    try {
      setMapInstance(map);
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

  const getMarkerIcon = (status) => {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: status === 'timeline' ? '#4CAF50' : '#FFA726',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 8,
    };
  };

  const marlMarkerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#4285F4',
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#ffffff',
    scale: 8,
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
              Error loading maps: {loadError.message}
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
              center={{ lat: 51.6557, lng: 7.0904 }}
              zoom={12}
              options={mapOptions}
              onLoad={handleMapLoad}
              onError={handleMapError}
            >
              {/* Activity markers are now handled by updateActivityMarkers */}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;