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
  const currentDayTitle = dayTitles[currentDay] || `Day ${currentDay + 1}`;

  return (
    <TimelineContainer>
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
          <DayTitle onClick={handleEditTitle}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              {currentDayTitle}
            </Typography>
            <EditIconButton className="edit-icon">
              <EditIcon fontSize="small" />
            </EditIconButton>
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

      <Droppable droppableId={`timeline-${currentDay}`}>
        {(provided) => (
          <TimelineContent ref={provided.innerRef} {...provided.droppableProps}>
            {dayActivities.map((activity, index) => (
              <Draggable
                key={activity.id}
                draggableId={activity.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      width: '100%',
                      ...provided.draggableProps.style
                    }}
                  >
                    <Activity
                      id={activity.id}
                      title={activity.title}
                      address={activity.address}
                      price={activity.price}
                      tags={activity.tags}
                      rating={activity.rating}
                      image={activity.image}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </TimelineContent>
        )}
      </Droppable>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#2c3446',
            color: 'white'
          }
        }}
      >
        <DialogTitle>Remove {currentDayTitle}?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {currentDayTitle}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmRemoveDay}
            variant="contained"
            sx={{ 
              backgroundColor: '#ff4444',
              '&:hover': {
                backgroundColor: '#cc0000'
              }
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showEditTitleDialog}
        onClose={() => setShowEditTitleDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#2c3446',
            color: 'white'
          }
        }}
      >
        <DialogTitle>Edit Day Title</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Day Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: '#666',
                },
                '&:hover fieldset': {
                  borderColor: '#4CAF50',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4CAF50',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#999',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#4CAF50',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowEditTitleDialog(false)}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTitle}
            variant="contained"
            sx={{ 
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </TimelineContainer>
  );
};

export default TimelineView; 