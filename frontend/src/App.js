import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./MyComponents/Signup";
import { Login } from "./MyComponents/Login";
import Home from "./Home";
import Mxg from "./MyComponents/Mxg";
import Profile from "./Profile";
import AddFriends from "./MyComponents/AddFriends";
import FriendRequests from "./MyComponents/FriendRequests"; // Optional if added
import AdminPanel from "./admin/AdminPanel";
import UploadEvents from "./admin/UploadEvents";
import Events from "./admin/Events";
import UsersTable from "./admin/UsersTable";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    try {
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      }
    } catch (err) {
      console.error("Invalid user JSON in localStorage");
    } finally {
      setLoadingUser(false);
    }
  }, []);

  if (loadingUser) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mxg" element={<Mxg />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/add-friends"
          element={<AddFriends currentUserId={user?._id} />}
        />
        <Route
          path="/friend-requests"
          element={<FriendRequests />}
        />

        {/* Admin panel */}
        <Route path="/dashboard" element={<AdminPanel />} />
        <Route path="/upload-event" element={<UploadEvents />} />
        <Route path="/event" element={<Events />} />
        <Route path="/user" element={<UsersTable />} />
        

      </Routes>
    </Router>
  );
}

export default App;
