import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate, useLocation } from 'react-router-dom';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#2c3446',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: active ? '#4CAF50' : '#ffffff',
  margin: '0 8px',
  padding: '8px 16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.1)',
  },
  '& .MuiButton-startIcon': {
    color: active ? '#4CAF50' : '#ffffff',
  },
}));

const Logo = styled(Typography)(({ theme }) => ({
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  marginRight: '32px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Logo>
          <TimelineIcon /> TripAhead
        </Logo>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <NavButton
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            active={isActive('/')}
          >
            Home
          </NavButton>
          <NavButton
            startIcon={<TimelineIcon />}
            onClick={() => navigate('/timeline')}
            active={isActive('/timeline')}
          >
            Timeline
          </NavButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}

export default Navbar; 