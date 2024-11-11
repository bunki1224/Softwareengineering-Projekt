import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Rating } from '@mui/material';
import { styled } from '@mui/system';

const ActivityCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.5),
  margin: theme.spacing(1),
  borderRadius: theme.spacing(2),
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
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

const Activity = ({ title, address, price, tags, rating, image }) => {
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
    	</Box>

  	</CardContent>

  	{/* Thumbnail */}
  	<Thumbnail src={image} alt={title} />
	</ActivityCard>
  );
};

export default Activity;


