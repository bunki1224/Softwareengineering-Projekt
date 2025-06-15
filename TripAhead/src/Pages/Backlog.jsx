import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Activity from '../components/Activity';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  IconButton,
  Typography,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import '../styles/Backlog.css';
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

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

const Backlog = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState({ backlog: [], timeline: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [autocomplete, setAutocomplete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    address: '',
    price: '',
    tags: '',
    rating: 0,
    image_url: ''
  });
  const [currentDay, setCurrentDay] = useState(1);
  const [totalDays, setTotalDays] = useState(1);
  const [dayTitles, setDayTitles] = useState({});

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey,
    libraries: ["places"]
  });

  useEffect(() => {
    if (!googleMapsApiKey) {
      setError('Google Maps API key is missing. Please add it to your .env file.');
    }
    if (!tripId) {
      setError('No trip ID provided');
      setLoading(false);
      return;
    }
    
    const loadData = async () => {
      try {
        setLoading(true);
        await checkTripAndFetchActivities();
        await fetchDays();
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [tripId]);

  const checkTripAndFetchActivities = async () => {
    try {
      const tripResponse = await fetch(`http://localhost:3000/trips/${tripId}`);
      
      if (tripResponse.status === 404) {
        setError('Trip not found');
        setLoading(false);
        return;
      }
      
      if (!tripResponse.ok) {
        throw new Error('Failed to check trip');
      }
      
      await fetchActivities();
    } catch (error) {
      console.error('Error checking trip:', error);
      setError('Failed to load trip');
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      console.log('Fetching activities for trip:', tripId);
      const response = await fetch(`http://localhost:3000/trips/${tripId}/activities`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const data = await response.json();
      console.log('Received activities:', data);
      
      // Ensure all activities have string IDs
      const processedData = data.map(activity => ({
        ...activity,
        id: String(activity.id)
      }));
      
      const transformedData = {
        backlog: processedData.filter(a => a.status === 'backlog'),
        timeline: processedData.filter(a => a.status === 'timeline')
      };
      
      setActivities(transformedData);
      
      // Update total days based on the highest day number in timeline activities
      const maxDay = Math.max(...transformedData.timeline.map(a => a.day || 0), 0);
      const newTotalDays = Math.max(maxDay, 1);
      setTotalDays(newTotalDays);
      
      // Ensure current day is valid
      if (currentDay > newTotalDays) {
        setCurrentDay(newTotalDays);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
      setLoading(false);
    }
  };

  const fetchDays = async () => {
    try {
      const response = await fetch(`http://localhost:3000/trips/${tripId}/days`);
      if (!response.ok) {
        throw new Error('Failed to fetch days');
      }
      const days = await response.json();
      
      // Convert days array to title map
      const titles = {};
      days.forEach(day => {
        titles[day.day_number] = day.title;
      });
      setDayTitles(titles);
      
      // Update total days
      if (days.length > 0) {
        const maxDay = Math.max(...days.map(d => d.day_number));
        setTotalDays(maxDay);
      }
    } catch (error) {
      console.error('Error fetching days:', error);
      setError('Failed to load days');
    }
  };

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const activity = {
          title: place.name || 'Unnamed Place',
          description: place.formatted_address || '',
          address: place.formatted_address || '',
          price: 0,
          tags: ['Sightseeing'],
          rating: place.rating ? Math.round(place.rating) : 0,
          image_url: place.photos && place.photos[0] ? place.photos[0].getUrl() : 'https://source.unsplash.com/random/300x200',
          position_lat: place.geometry.location.lat(),
          position_lng: place.geometry.location.lng()
        };

        handleAddActivity(activity);
        setSearchQuery('');
      }
    }
  };

  const handleAddActivity = async (activity) => {
    try {
      const response = await fetch(`http://localhost:3000/trips/${tripId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...activity,
          status: 'backlog',
          trip_id: tripId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add activity');
      }

      await fetchActivities();
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding activity:', error);
      setError('Failed to add activity');
    }
  };

  const handleCreateActivity = async () => {
    try {
      const response = await fetch(`http://localhost:3000/trips/${tripId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newActivity,
          status: 'backlog',
          trip_id: tripId,
          tags: newActivity.tags.split(',').map(tag => tag.trim())
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create activity');
      }

      // Refresh both activities and days data
      await Promise.all([
        fetchActivities(),
        fetchDays()
      ]);

      setOpenModal(false);
      setNewActivity({
        title: '',
        description: '',
        address: '',
        price: '',
        tags: '',
        rating: 0,
        image_url: ''
      });
    } catch (error) {
      console.error('Error creating activity:', error);
      setError('Failed to create activity');
    }
  };

  const handleAddDay = async () => {
    try {
      const newDay = totalDays + 1;
      
      // Create the new day in the database
      const response = await fetch(`http://localhost:3000/trips/${tripId}/days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day_number: newDay,
          title: `Day ${newDay}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add day');
      }

      const newDayData = await response.json();
      
      // Update local state with the new day
      setDayTitles(prev => ({
        ...prev,
        [newDayData.day_number]: newDayData.title
      }));
      
      setTotalDays(newDay);
      setCurrentDay(newDay);
      
      // Refresh days to ensure we have the latest data
      await fetchDays();
    } catch (error) {
      console.error('Error adding day:', error);
      setError('Failed to add day');
    }
  };

  const handleRemoveDay = async (dayToRemove) => {
    try {
      // Delete the day from the database
      const response = await fetch(`http://localhost:3000/trips/${tripId}/days/${dayToRemove}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove day');
      }

      // Update local state
      const newDayTitles = { ...dayTitles };
      delete newDayTitles[dayToRemove];
      
      // Shift remaining titles down
      Object.keys(newDayTitles).forEach(day => {
        const dayNum = parseInt(day);
        if (dayNum > dayToRemove) {
          newDayTitles[dayNum - 1] = newDayTitles[dayNum];
          delete newDayTitles[dayNum];
        }
      });
      
      setDayTitles(newDayTitles);
      setTotalDays(prev => prev - 1);
      
      // If we're removing the current day, switch to the previous day
      if (currentDay === dayToRemove) {
        setCurrentDay(prev => prev - 1);
      }
      
      // Refresh activities to get updated day numbers
      await fetchActivities();
    } catch (error) {
      console.error('Error removing day:', error);
      setError('Failed to remove day');
    }
  };

  const handleUpdateDayTitle = async (day, title) => {
    try {
      const response = await fetch(`http://localhost:3000/trips/${tripId}/days/${day}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to update day title');
      }

      setDayTitles(prev => ({
        ...prev,
        [day]: title
      }));
    } catch (error) {
      console.error('Error updating day title:', error);
      setError('Failed to update day title');
    }
  };

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(prev => prev - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDay < totalDays) {
      setCurrentDay(prev => prev + 1);
    }
  };

  const handleEditActivity = async (id, updatedActivity) => {
    try {
      console.log('Editing activity:', id, updatedActivity);
      const response = await fetch(`http://localhost:3000/activities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedActivity),
      });

      if (!response.ok) {
        throw new Error('Failed to update activity');
      }

      await fetchActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      setError('Failed to update activity');
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      console.log('Deleting activity:', id);
      const response = await fetch(`http://localhost:3000/trips/${tripId}/activities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      await fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const sourceList = source.droppableId;
    const destList = destination.droppableId;

    console.log('Drag end:', { sourceList, destList, draggableId });

    // Store the original state in case we need to revert
    const originalActivities = { ...activities };

    try {
      // Optimistically update the UI
      const sourceItems = [...activities[sourceList]];
      const [removed] = sourceItems.splice(source.index, 1);
      const destItems = sourceList === destList ? sourceItems : [...activities[destList]];
      destItems.splice(destination.index, 0, removed);

      const newActivities = {
        ...activities,
        [sourceList]: sourceItems,
        [destList]: destItems,
      };

      setActivities(newActivities);

      // Make the API call
      const response = await fetch(`http://localhost:3000/trips/${tripId}/activities/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: destList === 'backlog' ? 'backlog' : 'timeline',
          day: destList === 'backlog' ? null : currentDay,
        }),
      });

      if (!response.ok) {
        // Revert to original state if the API call fails
        setActivities(originalActivities);
        throw new Error('Failed to update activity');
      }

      // Refresh the activities to ensure consistency
      await fetchActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      setError('Failed to update activity');
    }
  };

  const handleMoveToDay = async (activityId, day) => {
    try {
      console.log('Moving activity to day:', { activityId, day });
      
      // First, ensure the day exists
      const dayResponse = await fetch(`http://localhost:3000/trips/${tripId}/days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day_number: day,
          title: `Day ${day}`
        }),
      });

      if (!dayResponse.ok) {
        const errorData = await dayResponse.json();
        throw new Error(errorData.error || 'Failed to create day');
      }

      // Then update the activity
      const response = await fetch(`http://localhost:3000/trips/${tripId}/activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'timeline',
          day: day,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update activity');
      }

      // Refresh the activities to ensure consistency
      await fetchActivities();
      await fetchDays(); // Also refresh days to ensure we have the latest data
    } catch (error) {
      console.error('Error updating activity:', error);
      setError(error.message || 'Failed to update activity');
    }
  };

  const handleMoveToBacklog = async (activityId) => {
    try {
      const response = await fetch(`http://localhost:3000/trips/${tripId}/activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'backlog',
          day: null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to move activity to backlog');
      }

      await fetchActivities();
    } catch (error) {
      console.error('Error moving activity to backlog:', error);
      setError('Failed to move activity to backlog');
    }
  };

  if (loading) {
    return (
      <div className="backlog-container">
        <div className="loading">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backlog-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="backlog-container">
        <div className="backlog-layout">
          <div className="backlog-sidebar">
            <div className="search-section">
              {error ? (
                <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
              ) : loadError ? (
                <div style={{ color: 'red' }}>Error loading maps: {loadError.message}</div>
              ) : !isLoaded ? (
                <div>Loading Maps...</div>
              ) : (
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search for places..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Autocomplete>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenModal(true)}
                className="add-button"
              >
                Add
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/trip/${tripId}`)}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Back to Trip
              </Button>
            </div>
            <div className="backlog-list">
              <h2>Backlog</h2>
              <Droppable droppableId="backlog">
                {(provided) => (
                  <div
                    className="activity-list"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {activities.backlog.map((activity, index) => (
                      <Draggable
                        key={String(activity.id)}
                        draggableId={String(activity.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <Activity
                              id={activity.id}
                              title={activity.title}
                              address={activity.address}
                              price={activity.price}
                              tags={activity.tags || []}
                              rating={activity.rating}
                              image={activity.image_url}
                              onEdit={handleEditActivity}
                              onDelete={handleDeleteActivity}
                              onMoveToDay={handleMoveToDay}
                              onMoveToBacklog={handleMoveToBacklog}
                              totalDays={totalDays}
                              status={activity.status}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          <div className="timeline-section">
            <div className="timeline-header">
              <div className="day-navigation">
                <IconButton 
                  onClick={handlePreviousDay}
                  disabled={currentDay === 1}
                  sx={{ color: 'white' }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>
                <Typography variant="h6" sx={{ color: 'white', mx: 2 }}>
                  {dayTitles[currentDay] || `Day ${currentDay}`}
                </Typography>
                <IconButton 
                  onClick={handleNextDay}
                  disabled={currentDay === totalDays}
                  sx={{ color: 'white' }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddDay}
                className="add-button"
              >
                Add Day
              </Button>
            </div>
            <div className="day-list">
              <Droppable droppableId="timeline">
                {(provided) => (
                  <div
                    className="activity-list"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {activities.timeline
                      .filter(activity => activity.day === currentDay)
                      .map((activity, index) => (
                        <Draggable
                          key={String(activity.id)}
                          draggableId={String(activity.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                            >
                              <Activity
                                id={activity.id}
                                title={activity.title}
                                address={activity.address}
                                price={activity.price}
                                tags={activity.tags || []}
                                rating={activity.rating}
                                image={activity.image_url}
                                onEdit={handleEditActivity}
                                onDelete={handleDeleteActivity}
                                onMoveToDay={handleMoveToDay}
                                onMoveToBacklog={handleMoveToBacklog}
                                totalDays={totalDays}
                                status={activity.status}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>

        <Dialog open={openModal} onClose={() => setOpenModal(false)}>
          <DialogTitle>
            Create New Activity
            <IconButton
              onClick={() => setOpenModal(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={newActivity.title}
              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Address"
              value={newActivity.address}
              onChange={(e) => setNewActivity({ ...newActivity, address: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Price"
              value={newActivity.price}
              onChange={(e) => setNewActivity({ ...newActivity, price: e.target.value })}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={newActivity.tags}
              onChange={(e) => setNewActivity({ ...newActivity, tags: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Image URL"
              value={newActivity.image_url}
              onChange={(e) => setNewActivity({ ...newActivity, image_url: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button onClick={handleCreateActivity} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </DragDropContext>
  );
};

export default Backlog; 