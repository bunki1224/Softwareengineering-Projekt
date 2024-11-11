import React from 'react';
import { Rating } from '@mui/material';

function CustomRating({ value, onChange }) {
  return (
	<div>
  	<Rating
    	name="custom-controlled"
    	value={value}
    	onChange={(event, newValue) => onChange(newValue)}
  	/>
	</div>
  );
}

export default CustomRating;


