import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/system';

const CustomTextField = styled((props) => (
  <TextField 
  variant="outlined"
  fullWidth margin="normal"
  {...props} />
))({});

export default CustomTextField;