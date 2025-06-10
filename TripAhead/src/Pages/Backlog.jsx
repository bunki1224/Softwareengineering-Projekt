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
  const [searchResults, setSearchResults] = useState([]);
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

  useEffect(() => {
    if (!tripId) {
      setError('No trip ID provided');
      setLoading(false);
      return;
    }
    checkTripAndFetchActivities();
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
      
      const transformedData = {
        backlog: data.filter(a => a.status === 'backlog'),
        timeline: data.filter(a => a.status === 'timeline')
      };
      
      setActivities(transformedData);
      
      const maxDay = Math.max(...transformedData.timeline.map(a => a.day || 0), 0);
      const newDays = Array.from({ length: Math.max(maxDay + 1, 1) }, (_, i) => ({
        id: `day${i + 1}`,
        title: `Day ${i + 1}`
      }));
      setTotalDays(maxDay + 1);
      setCurrentDay(1);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/activities/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search activities');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching activities:', error);
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
      setSearchResults([]);
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

      await fetchActivities();
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

  const handleAddDay = () => {
    setTotalDays(prev => prev + 1);
    setCurrentDay(prev => prev + 1);
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

    // Optimistically update the UI
    const sourceItems = [...activities[sourceList === 'backlog' ? 'backlog' : 'timeline']];
    const [removed] = sourceItems.splice(source.index, 1);
    const destItems = sourceList === destList ? sourceItems : [...activities[destList === 'backlog' ? 'backlog' : 'timeline']];
    destItems.splice(destination.index, 0, removed);

    setActivities({
      ...activities,
      [sourceList === 'backlog' ? 'backlog' : 'timeline']: sourceItems,
      [destList === 'backlog' ? 'backlog' : 'timeline']: destItems,
    });

    try {
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
        throw new Error('Failed to update activity');
      }

      await fetchActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      setError('Failed to update activity');
      await fetchActivities();
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
              <input
                type="text"
                className="search-input"
                placeholder="Search for activities..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenModal(true)}
                className="add-button"
              >
                Add
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(activity => (
                  <div key={activity.id} className="search-result-item" onClick={() => handleAddActivity(activity)}>
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                  </div>
                ))}
              </div>
            )}
            <Droppable droppableId="backlog">
              {(provided) => (
                <div
                  className="backlog-list"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>Backlog</h2>
                  <div className="activity-list">
                    {activities.backlog.map((activity, index) => (
                      <Draggable
                        key={activity.id}
                        draggableId={activity.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
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
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
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
                  Day {currentDay}
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
            <Droppable droppableId={`day${currentDay}`}>
              {(provided) => (
                <div
                  className="day-list"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="activity-list">
                    {activities.timeline
                      .filter(activity => activity.day === currentDay)
                      .map((activity, index) => (
                        <Draggable
                          key={activity.id}
                          draggableId={activity.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
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
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
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