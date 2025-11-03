import React from 'react';
import { useNavigate } from 'react-router-dom';

import './Leftslidebar.css';

import {
    FiHome,
    FiUser,
    FiMessageSquare,
    FiUserPlus,      // add friend request icon from react-icons/fi
    FiSettings,
    FiCalendar,
    FiLogOut
} from 'react-icons/fi';

function Leftslidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    navigate("/login"); // Redirect to login
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
              <FiHome /> <span>Home</span>
            </li>
            <li onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <FiUser /> <span>Profile</span>
            </li>
            <li onClick={() => navigate('/mxg')} style={{ cursor: 'pointer' }}>
              <FiMessageSquare /> <span>Messages</span>
            </li>
            <li onClick={() => navigate('/add-friends')} style={{ cursor: 'pointer' }}>
              <FiUserPlus /> <span>Add Friends</span>
            </li>
            <li>
              <FiCalendar /> <span>Events</span>
            </li>
            <li>
              <FiSettings /> <span>Settings</span>
            </li>
            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <FiLogOut /> <span>Logout</span>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export default Leftslidebar;
