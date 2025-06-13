import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Paper,
  styled,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Droppable, Draggable } from "@hello-pangea/dnd";
import Activity from './Activity';

const TimelineContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: '#424b64',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '10px',
  overflow: 'hidden'
}));

const TimelineHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  backgroundColor: '#2c3446',
  borderBottom: '1px solid #424b64',
  gap: theme.spacing(2)
}));

const TimelineContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
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
  gap: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    '& .edit-icon': {
      opacity: 1
    }
  }
}));

const EditIconButton = styled(IconButton)(({ theme }) => ({
  opacity: 0,
  transition: 'opacity 0.2s',
  padding: theme.spacing(0.5),
  '&:hover': {
    color: '#4CAF50'
  }
}));

const TimelineView = ({ 
  activities, 
  onDelete, 
  onEdit, 
  currentDay, 
  onDayChange, 
  maxDays, 
  onAddDay, 
  onRemoveDay,
  dayTitles,
  onUpdateDayTitle
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditTitleDialog, setShowEditTitleDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleNextDay = () => {
    if (currentDay < maxDays - 1) {
      onDayChange(currentDay + 1);
    }
  };

  const handlePreviousDay = () => {
    if (currentDay > 0) {
      onDayChange(currentDay - 1);
    }
  };

  const handleRemoveDay = () => {
    setShowDeleteDialog(true);
  };

  const confirmRemoveDay = () => {
    onRemoveDay(currentDay);
    setShowDeleteDialog(false);
    // Switch to previous day if we're removing the last day
    if (currentDay === maxDays - 1) {
      onDayChange(currentDay - 1);
    }
  };

  const handleEditTitle = () => {
    setNewTitle(dayTitles[currentDay] || `Day ${currentDay + 1}`);
    setShowEditTitleDialog(true);
  };

  const handleSaveTitle = () => {
    onUpdateDayTitle(currentDay, newTitle);
    setShowEditTitleDialog(false);
  };

  // Only show activities for the current day
  const dayActivities = activities.filter(activity => activity.day === currentDay);

  return (
    <TimelineContainer>
      <TimelineHeader>
        <DayTitle onClick={handleEditTitle}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {dayTitles[currentDay] || `Day ${currentDay + 1}`}
          </Typography>
          <EditIconButton className="edit-icon">
            <EditIcon fontSize="small" />
          </EditIconButton>
        </DayTitle>
        <HeaderControls>
          <IconButton 
            onClick={handlePreviousDay}
            disabled={currentDay === 0}
            sx={{ color: 'white' }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton 
            onClick={handleNextDay}
            disabled={currentDay === maxDays - 1}
            sx={{ color: 'white' }}
          >
            <NavigateNextIcon />
          </IconButton>
        </HeaderControls>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddDay}
            disabled={maxDays >= 14}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#45a049'
              },
              '&.Mui-disabled': {
                backgroundColor: '#666'
              }
            }}
          >
            Add Day
          </Button>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={handleRemoveDay}
            disabled={currentDay === 0 || dayActivities.length > 0}
            sx={{
              backgroundColor: '#ff4444',
              '&:hover': {
                backgroundColor: '#cc0000'
              },
              '&.Mui-disabled': {
                backgroundColor: '#666'
              }
            }}
          >
            Remove Day
          </Button>
        </Box>
      </TimelineHeader>

      <TimelineContent>
        <Droppable droppableId={`timeline-${currentDay}`}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ flex: 1, minHeight: 100 }}
            >
              {dayActivities.map((activity, index) => (
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
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </TimelineContent>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Remove Day</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this day? All activities will be moved back to the backlog.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmRemoveDay} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditTitleDialog} onClose={() => setShowEditTitleDialog(false)}>
        <DialogTitle>Edit Day Title</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Day Title"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditTitleDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTitle} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </TimelineContainer>
  );
};

export default TimelineView; 