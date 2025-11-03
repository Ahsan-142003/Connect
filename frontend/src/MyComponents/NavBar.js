import React, { useState } from 'react';
import { FiSearch, FiBell, FiMessageSquare } from 'react-icons/fi';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';


function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
        <span className="logo"  >Connect Guru</span>
       
      </div>

      <div className="navbar-center">
        <div className="search-bar">
          <span className="search-icon">
            <FiSearch size={20} />
          </span>
          <input type="text" placeholder="Type in search" />
        </div>
      </div>

      <div className="navbar-right">
        <div className="icon-button" onClick={() => navigate('/mxg')}>
          <FiMessageSquare size={24} />
        
        </div>
        <div className="icon-button" > 
          <FiBell size={24} />
        </div>

        <div className={`profile-container ${dropdownOpen ? 'active' : ''}`}>
          <img
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="Profile"
            className="profile-image"
            onClick={toggleDropdown}
          />
          <div className="dropdown">
            <div className="dropdown-item">Profile</div>
            <div className="dropdown-item">Sign out</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
