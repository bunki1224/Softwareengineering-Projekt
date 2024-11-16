import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Rating, Button, Modal } from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';

const ActivityCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.5),
  margin: theme.spacing(1),
  borderRadius: theme.spacing(2),
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  minHeight: 120, // Feste Mindesthöhe
  flexShrink: 0,
  width: "95%",
}));

const Thumbnail = styled('img')({
  width: 100,
  height: 100,
  borderRadius: '10%',
  objectFit: 'cover',
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
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const Activity = ({ title, address, price, tags, rating, image }) => {

  {/* Modal*/}
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  return (
	<ActivityCard>
  	<CardContent sx={{ flex: 1 }}>
    	{/* Title */}
    	<Typography variant="h6" component="div" gutterBottom>
      	{title}
    	</Typography>

    	{/* Address */}
    	<Typography variant="body2" color="textSecondary">
      	{address}
    	</Typography>

    	{/* Price and Tags */}
    	<Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
      	<PriceBadge label={`${price} €`} />

      	{tags.map((tag) => (
        	<TagChip key={tag} label={tag} />
      	))}
		{/* Rating */}
		<Rating value={rating} readOnly size="small" />

    {/* Edit Button and Edit Modal*/}
    <div>
      <Button variant='contained' startIcon={<EditIcon />} onClick={handleOpen} >edit</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={ModalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            //ToDo:
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            editable values...
          </Typography>
        </Box>
      </Modal>
    </div>
    	</Box>

  	</CardContent>

  	{/* Thumbnail */}
  	<Thumbnail src={image} alt={title} />
	</ActivityCard>
  );
};


export default Activity;
