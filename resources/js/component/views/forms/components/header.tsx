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
import SearchBar from '../../../views/searchbar';

import DashboardIcon from '@mui/icons-material/Dashboard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatIcon from '@mui/icons-material/Chat';
import BrushIcon from '@mui/icons-material/Brush';
import PrintIcon from '@mui/icons-material/Print';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MapIcon from '@mui/icons-material/Map';
import HomeIcon from '@mui/icons-material/Home';

interface HeaderProps {
  onLocationSelect?: (location: any) => void;
}

const Header: React.FC<HeaderProps> = ({ onLocationSelect }) => {
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

  const isUserRole = () => {
    return user && (user.role.rolename === 'User' );
  };
  const isDesingerOrProviderRole = () => {
    return user && (user.role.rolename === 'Printing Shop' || user.role.rolename === 'Graphic Designer');
  };
  const isMultipleRole = () => {
    return user && (user.role.rolename === 'Printing Shop' || user.role.rolename === 'Graphic Designer'  || user.role.rolename === 'User');
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

           {/* Replace the original search bar code with the imported SearchBar component */}
           <SearchBar onLocationSelect={onLocationSelect} />

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
              {/* <Avatar
                src={user.personal_information?.profilepicture || 'https://via.placeholder.com/40'}
                alt="Profile"
                sx={{
                  width: isSidebarExpanded ? 64 : 40,
                  height: isSidebarExpanded ? 64 : 40,
                  transition: 'width 0.3s ease, height 0.3s ease',
                }}
              /> */}
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
                <NavLink to="/user" className="text-white">
          <ListItem>
            <ListItemIcon sx={{ color: 'white' }}>
              <HomeIcon />
            </ListItemIcon>
            {isSidebarExpanded && <ListItemText primary="Home" />}
          </ListItem>
        </NavLink>
          {/* List of Icons */}
          <List sx={{ mt: 3 }}>
            {/* Dashboard */}
            {/* <NavLink to="/List-of-Desinger&Printing-Provider" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <DashboardIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Dashboard" />}
              </ListItem>
            </NavLink> */}
          {isUserRole() && (  
            <NavLink to="/dashboard" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <DashboardIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Dashboard" />}
              </ListItem>
            </NavLink>
              )}

        {isMultipleRole() && (   
           <NavLink to="/paymentstable" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <FavoriteIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Transaction" />}
              </ListItem>
            </NavLink>
          )}
          
            <NavLink to="/chats" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <ChatIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Chat" />}
              </ListItem>
            </NavLink>

        
      {isDesingerOrProviderRole () && (   
            <NavLink to="/clientpost" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <BrushIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Clients" />}
              </ListItem>
            </NavLink>
          )}
            {/* Print Shop
            <NavLink to="/allposts" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <PrintIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Allposts" />}
              </ListItem>
            </NavLink> */}

            {/* My Purchase */}
            {/* <NavLink to="/providerpost" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <ShoppingCartIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Provider" />}
              </ListItem>
            </NavLink>
            <NavLink to="/designerpost" className="text-white">
              <ListItem>
                <ListItemIcon sx={{ color: 'white' }}>
                  <ShoppingCartIcon />
                </ListItemIcon>
                {isSidebarExpanded && <ListItemText primary="Designer" />}
              </ListItem>
            </NavLink> */}

        
        
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

      {isUserRole() && (         
            <NavLink to="/getlocation" className="text-white">
            <ListItem>
              <ListItemIcon sx={{ color: 'white' }}>
                <MapIcon />
              </ListItemIcon>
              {isSidebarExpanded && <ListItemText primary="Nearby" />}
            </ListItem>
          </NavLink>
          )}

      {isDesingerOrProviderRole() && (         
                  <NavLink to="/share-location" className="text-white">
                  <ListItem>
                    <ListItemIcon sx={{ color: 'white' }}>
                      <MapIcon />
                    </ListItemIcon>
                    {isSidebarExpanded && <ListItemText primary="Add location" />}
                  </ListItem>
                </NavLink>
                )}

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