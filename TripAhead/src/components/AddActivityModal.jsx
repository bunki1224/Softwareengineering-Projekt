import React, { useState } from 'react';
import { Button, Modal, Box, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CustomTextField from './CustomTextField';
import CustomRating from './CustomRating';

const ModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #00000000',
  boxShadow: 24,
  p: 4,
  borderRadius: "10px"
};

const AddActivityModal = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [activityData, setActivityData] = useState({
    title: '',
    address: '',
    price: '',
    tags: '',
    rating: 0,
    image: 'https://source.unsplash.com/random/300x200' // Default image
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Reset form data when closing
    setActivityData({
      title: '',
      address: '',
      price: '',
      tags: '',
      rating: 0,
      image: 'https://source.unsplash.com/random/300x200'
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setActivityData({ ...activityData, [name]: value });
  };

  const handleRatingChange = (newValue) => {
    setActivityData({ ...activityData, rating: newValue });
  };

  const handleSubmit = () => {
    // Create new activity object
    const newActivity = {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      title: activityData.title,
      address: activityData.address,
      price: activityData.price,
      tags: activityData.tags.split(',').map(tag => tag.trim()),
      rating: activityData.rating,
      image: activityData.image || 'https://source.unsplash.com/random/300x200'
    };

    // Call the onAdd callback with the new activity
    onAdd(newActivity);
    handleClose();
  };

  return (
    <>
      <IconButton 
        onClick={handleOpen}
        sx={{
          backgroundColor: '#4CAF50',
          color: 'white',
          '&:hover': {
            backgroundColor: '#45a049',
          },
          marginLeft: '10px'
        }}
      >
        <AddIcon />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={ModalStyle}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            style={{ color: "gray", marginBottom: "20px" }}
          >
            Add New Activity
          </Typography>

          <Box
            component="form"
            noValidate
            autoComplete="off"
          >
            <CustomTextField
              label="Title"
              name="title"
              value={activityData.title}
              onChange={handleInputChange}
              required
            />
            <CustomTextField
              label="Address"
              name="address"
              value={activityData.address}
              onChange={handleInputChange}
              required
            />
            <CustomTextField
              label="Price"
              name="price"
              value={activityData.price}
              onChange={handleInputChange}
              required
            />
            <CustomTextField
              label="Tags (comma separated -> Tag1, Tag2)"
              name="tags"
              value={activityData.tags}
              onChange={handleInputChange}
              required
            />
            <CustomTextField
              label="Image Link"
              name="image"
              value={activityData.image}
              onChange={handleInputChange}
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography component="legend">Rating</Typography>
              <CustomRating
                value={activityData.rating}
                onChange={handleRatingChange}
              />
            </Box>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              fullWidth
              disabled={!activityData.title || !activityData.address || !activityData.price || !activityData.tags}
            >
              Add Activity
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default AddActivityModal; 