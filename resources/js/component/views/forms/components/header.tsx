import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { FaSignOutAlt, FaPlus } from 'react-icons/fa';
import { Search as SearchIcon } from '@mui/icons-material';
import { InputBase } from '@mui/material';
import NotificationsDropdown from '../components/NotificationsDropDown';
import Avatar from '@mui/material/Avatar';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

import DashboardIcon from '@mui/icons-material/Dashboard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatIcon from '@mui/icons-material/Chat';
import BrushIcon from '@mui/icons-material/Brush';
import PrintIcon from '@mui/icons-material/Print';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Header: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Sidebar starts collapsed
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded); // Toggle sidebar state
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* AppBar */}
      <AppBar position="fixed" color="inherit" elevation={1} sx={{ backgroundColor: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{ marginRight: 2, color: 'black' }}
          >
            <MenuIcon />
          </IconButton>

          <Box display="flex" alignItems="center" sx={{ flexGrow: 2 }}>
            <div className="text-black font-extrabold text-3xl ml-2">
              <span className="text-blue-500">C</span>
              <span className="text-blue-500">u</span>
              <span className="text-blue-500">s</span>
              <span className="text-yellow-500">t</span>
              <span className="text-blue-500">M</span>
              <span className="text-yellow-500">e</span>
            </div>
          </Box>

          <Box sx={{ flexGrow: 4, display: 'flex', justifyContent: 'flex-start' }}>
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <SearchIcon className="text-black" />
              </div>
              <InputBase
                placeholder="Search…"
                className="pl-12 pr-4 py-2 rounded-full bg-gray-200 text-black w-full"
                inputProps={{ 'aria-label': 'search' }}
              />
            </div>
          </Box>

          <Box display="flex" alignItems="center" sx={{ ml: 'auto' }}>
            <NotificationsDropdown />

            {user && (
              <Box ml={2}>
                <Avatar
                  src={user.personal_information?.profilepicture || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  sx={{ width: 40, height: 40 }}
                />
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar with Overlay */}
      <Drawer
        anchor="left"
        open={isSidebarExpanded}
        variant="temporary"  // Overlay variant for sidebar
        onClose={toggleSidebar}  // Sidebar will close on clicking outside
        ModalProps={{
          keepMounted: true,  // Improves performance by not unmounting
        }}
        sx={{
          width: isSidebarExpanded ? 240 : 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isSidebarExpanded ? 240 : 60,
            backgroundColor: '#1976d2',
            color: 'white',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            border: 'none', // Remove any unwanted borders
            padding: 0,     // Ensure no padding is applied
            margin: 0,      // Remove any margin applied
            boxShadow: 'none', // Ensure no shadow or lines
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {user && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              mt={10}
            >
              <Avatar
                src={user.personal_information?.profilepicture || 'https://via.placeholder.com/40'}
                alt="Profile"
                sx={{
                  width: isSidebarExpanded ? 64 : 40,
                  height: isSidebarExpanded ? 64 : 40,
                  transition: 'width 0.3s ease, height 0.3s ease',
                }}
              />
              {isSidebarExpanded && (
                <NavLink
                  to={`/clients/${user.id}/profile`}
                  className="text-white text-sm hover:underline"
                  style={{ marginTop: '8px' }}
                >
                  {user.username}
                </NavLink>
              )}
            </Box>
          )}

          {/* List of Icons */}
          <List sx={{ mt: 3 }}>
            {/* Dashboard */}
            <NavLink to="/List-of-Desinger&Printing-Provider" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <DashboardIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Dashboard" />}
              </ListItem>
            </NavLink>

            {/* Favorites */}
            <NavLink to="/favorites" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <FavoriteIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Favorites" />}
              </ListItem>
            </NavLink>

            {/* Chat */}
            <NavLink to="/chats" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <ChatIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Chat" />}
              </ListItem>
            </NavLink>

            {/* Designer */}
            <NavLink to="/allposts" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <BrushIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Designer" />}
              </ListItem>
            </NavLink>

            {/* Print Shop */}
            <NavLink to="/print-shop" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <PrintIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Print Shop" />}
              </ListItem>
            </NavLink>

            {/* My Purchase */}
            <NavLink to="/my-purchase" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <ShoppingCartIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="My Purchase" />}
              </ListItem>
            </NavLink>

            {/* Add Post */}
            <NavLink to="/posts" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <FaPlus />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Add Post" />}
              </ListItem>
            </NavLink>
          </List>

          {/* Logout */}
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center' }}>
            <ListItem onClick={handleLogout} sx={{ color: 'white' }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <FaSignOutAlt />
              </ListItemIcon>
              {isSidebarExpanded && <ListItemText primary="Logout" />}
            </ListItem>
          </Box>
        </Box>
      </Drawer>

      {/* Overlay when sidebar is open */}
      {isSidebarExpanded && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          }}
          onClick={toggleSidebar} // Close sidebar when overlay is clicked
        />
      )}
    </>
  );
};

export default Header;