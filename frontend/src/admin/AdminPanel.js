import React, { useState, useEffect } from "react";
import UserStats from "./UserStats";
import UsersTable from "./UsersTable";
import UploadEvents from "./UploadEvents";
import Events from "./Events";
import axios from "axios";
import "./Admin.css";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [events, setEvents] = useState([]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "events") {
      fetchEvents();
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h3 className="admin-title">Admin Panel</h3>
        <ul className="admin-nav">
          <li onClick={() => handleTabChange("dashboard")}>Dashboard</li>
          <li onClick={() => handleTabChange("upload")}>Upload Events</li>
          <li onClick={() => handleTabChange("users")}>Users</li>
          <li onClick={() => handleTabChange("events")}>Events</li> {/* ✅ Correct tab */}
        </ul>
      </aside>

      <main className="admin-main">
        {activeTab === "dashboard" && <UserStats />}
        {activeTab === "upload" && <UploadEvents />}
        {activeTab === "users" && <UsersTable />}
        {activeTab === "events" && <Events events={events} />}
      </main>
    </div>
  );
};

export default AdminPanel;
