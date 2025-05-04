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
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  minHeight: 120, // Feste Mindesthoehe
  flexShrink: 0,
  width: "95%",
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
  backgroundColor: '#c2dff0',
  color: 'black',
  fontWeight: 'bold',
  marginRight: '5px',
});

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

const textFieldStyle = {
  fullWidth: true,
  margin: 'normal',
};

const Activity = ({ id, title, address, price, tags, rating, image, onEdit, onDelete }) => {
  const [activityData, setActivityData] = useState({id,  title, address, price, tags, rating, image });
  const [open, setOpen] = useState(false);
  const [inputValues, setInputValues] = useState({ title, address, price, tags: tags.join(', '), rating, image });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValues({ ...inputValues, [name]: value });
  };

  const updateActivity = () => {
    //console.log("updateActivity was valled"); 
    setActivityData({
      ...inputValues,
      tags: inputValues.tags.split(',').map(tag => tag.trim())
    });

    onEdit(id, {
      ...inputValues,
      tags: inputValues.tags.split(',').map(tag => tag.trim())
    });
    handleClose();
  };

  function deleteActivity(id) {
    //console.log("deleteActivity was called" + id);
    onDelete(id);
  }

  return (
    <ActivityCard>
      <CardContent sx={{ flex: 1 }}>
        {/* Title */}
        <Typography variant="h6"
        component="div"
        gutterBottom>
          {activityData.title}
        </Typography>

        {/* Address */}
        <Typography
        variant="body2"
        color="textSecondary">
          {activityData.address}
        </Typography>

        {/* Price and Tags */}
        <Box sx={{ display: 'flex',
          alignItems: 'center',
          mt: 1 }}>

          <PriceBadge
          label={`${activityData.price} €`} />

          {activityData.tags.map((tag) => (
            <TagChip
            key={tag}
            label={tag} />
          ))}

          {/* Rating */}
          <Rating
          value={activityData.rating}
          precision="0.5"
          readOnly
          size="small" />

          {/* Edit Button and Edit Modal*/}
          <div>
            <IconButton
            onClick={handleOpen}>
              <EditIcon/>
            </IconButton>
            <IconButton
            onClick={() => deleteActivity(activityData.id)}>
              <DeleteIcon/>
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
                style={{color:"gray"}}>
                  Edit Activity
                </Typography>

                <Box
                component="form"
                noValidate
                autoComplete="off">

                  <CustomTextField
                    label="Title"
                    name="title"
                    value={inputValues.title}
                    onChange={handleInputChange}
                  />
                  <CustomTextField
                    label="Address"
                    name="address"
                    value={inputValues.address}
                    onChange={handleInputChange}
                  />
                  <CustomTextField
                    label="Price"
                    name="price"
                    value={inputValues.price}
                    onChange={handleInputChange}
                  />
                  <CustomTextField
                    label="Tags (comma separated -> Tag1, Tag2)"
                    name="tags"
                    value={inputValues.tags}
                    onChange={handleInputChange}
                  />
                  <CustomTextField
                    label="Image Link"
                    name="image"
                    value={inputValues.image}
                    onChange={handleInputChange}
                  />
                  <Button
                  onClick={updateActivity}
                  variant="contained"
                  color="primary"
                  fullWidth
                  margin="normal">
                    Update Activity
                  </Button>
                </Box>
              </Box>
            </Modal>
          </div>
        </Box>
      </CardContent>
      <Thumbnail
      src={activityData.image}
      alt={activityData.title} />
    </ActivityCard>
  );
};

export default Activity;