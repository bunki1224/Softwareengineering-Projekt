import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import LogoutIcon from '@mui/icons-material/Logout';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#213243',
});

const Logo = styled(Typography)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  cursor: 'pointer',
});

const NavButton = styled(Button)(({ theme, active }) => ({
  color: 'white',
  backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}));

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username');

  const handleHomeClick = () => {
    navigate('/trips');
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Logo onClick={handleHomeClick}>
          <FlightTakeoffIcon /> TripAhead
        </Logo>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <NavButton
            startIcon={<CardTravelIcon />}
            onClick={() => navigate('/trips')}
            active={isActive('/trips')}
          >
            My Trips
          </NavButton>
        </Box>
        {username && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: 'white' }}>
              Welcome, {username}
            </Typography>
            <NavButton
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </NavButton>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
}

export default Navbar; 