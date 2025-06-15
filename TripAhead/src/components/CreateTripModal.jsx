import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CreateTripModal = ({ open, onClose, onSubmit, loading }) => {
  const [tripData, setTripData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(tripData);
    // Reset form
    setTripData({
      title: '',
      description: '',
      start_date: '',
      end_date: ''
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Create New Trip
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Trip Title"
            name="title"
            value={tripData.title}
            onChange={handleInputChange}
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={tripData.description}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={3}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Start Date"
            name="start_date"
            type="date"
            value={tripData.start_date}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="End Date"
            name="end_date"
            type="date"
            value={tripData.end_date}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !tripData.title}
        >
          {loading ? 'Creating...' : 'Create Trip'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTripModal; 