import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './MyComponents/NavBar';
import Leftslidebar from './MyComponents/Leftslidebar';
import Rightslidebar from './MyComponents/Rightslidebar';
import Post from './MyComponents/Post';
import './Home.css';

import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  return (
    <>
      <NavBar />
      <div className="app-wrapper">
        {/* Left Sidebar */}
        <div className="left-sidebar">
          <Leftslidebar />
        </div>

        {/* Main Content */}
        <div className="main-content">
          <Post />
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          <Rightslidebar />
        </div>
      </div>
    </>
  );
}

export default Home;
