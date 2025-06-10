import React, { useState } from 'react';
import { Card, CardContent, Typography, Chip, Box, Rating, Button, IconButton, Modal, TextField } from '@mui/material';
import { border, borderRadius, color, styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import CustomTextField from "./CustomTextField";

const ActivityCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.5),
  margin: theme.spacing(1),
  borderRadius: theme.spacing(2),
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
  minHeight: 120,
  flexShrink: 0,
  width: "95%",
  background: 'white',
  color: '#213243',
}));

const Thumbnail = styled('img')({
  width: 150,
  height: 150,
  borderRadius: '16px',
  objectFit: 'cover',
  margin: '-10px -5px -10px -10px',
});

const PriceBadge = styled(Chip)({
  backgroundColor: '#d8a9f0',
  color: 'white',
  fontWeight: 'bold',
  marginRight: '5px',
});

const TagChip = styled(Chip)({
  backgroundColor: '#e8e8e8',
  color: '#213243',
  fontWeight: 'bold',
  marginRight: '5px',
});

const ModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #00000000',
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
  color: '#213243',
};

const textFieldStyle = {
  fullWidth: true,
  margin: 'normal',
  '& .MuiInputBase-root': {
    color: '#213243',
  },
  '& .MuiInputLabel-root': {
    color: '#666',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d8a9f0',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d8a9f0',
  },
};

const Activity = ({ id, title, address, price, tags, rating, image, onEdit, onDelete }) => {
  const [activityData, setActivityData] = useState({ id, title, address, price, tags, rating, image });
  const [open, setOpen] = useState(false);
  const [inputValues, setInputValues] = useState({ 
    title, 
    address, 
    price, 
    tags: Array.isArray(tags) ? tags.join(', ') : '', 
    rating, 
    image 
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  const updateActivity = () => {
    const updatedActivity = {
      ...inputValues,
      tags: inputValues.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    setActivityData(updatedActivity);
    onEdit(id, updatedActivity);
    handleClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      onDelete(id);
    }
  };

  return (
    <ActivityCard>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" component="div" gutterBottom sx={{ color: '#213243' }}>
          {activityData.title}
        </Typography>

        <Typography variant="body2" sx={{ color: '#666' }}>
          {activityData.address}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
          <PriceBadge label={`${activityData.price} €`} />

          {Array.isArray(activityData.tags) && activityData.tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}

          <Rating value={activityData.rating} precision="0.5" readOnly size="small" />

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <IconButton onClick={handleOpen} size="small" sx={{ color: '#213243' }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleDelete} size="small" sx={{ color: '#213243' }}>
              <DeleteIcon />
            </IconButton>
          </Box>

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={ModalStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2" style={{ color: "gray" }}>
                Edit Activity
              </Typography>

              <Box component="form" noValidate autoComplete="off">
                <CustomTextField
                  label="Title"
                  name="title"
                  value={inputValues.title}
                  onChange={handleInputChange}
                  required
                />
                <CustomTextField
                  label="Address"
                  name="address"
                  value={inputValues.address}
                  onChange={handleInputChange}
                  required
                />
                <CustomTextField
                  label="Price"
                  name="price"
                  value={inputValues.price}
                  onChange={handleInputChange}
                  type="number"
                  required
                />
                <CustomTextField
                  label="Tags (comma separated -> Tag1, Tag2)"
                  name="tags"
                  value={inputValues.tags}
                  onChange={handleInputChange}
                  helperText="Enter tags separated by commas"
                />
                <CustomTextField
                  label="Image Link"
                  name="image"
                  value={inputValues.image}
                  onChange={handleInputChange}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    onClick={handleClose}
                    variant="outlined"
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateActivity}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Update Activity
                  </Button>
                </Box>
              </Box>
            </Box>
          </Modal>
        </Box>
      </CardContent>
      {activityData.image && (
        <Thumbnail src={activityData.image} alt={activityData.title} />
      )}
    </ActivityCard>
  );
};

export default Activity;