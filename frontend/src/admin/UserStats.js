import React, { useEffect, useState } from "react";
import "./Admin.css";

const UserStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    alumni: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
const res = await fetch("http://localhost:5000/api/user/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h5>Total Users</h5>
        <p>{stats.totalUsers}</p>
      </div>
      <div className="stat-card">
        <h5>Students</h5>
        <p>{stats.students}</p>
      </div>
      <div className="stat-card">
        <h5>Alumni</h5>
        <p>{stats.alumni}</p>
      </div>
      <div className="stat-card">
        <h5>Total Events</h5>
        <p>{stats.totalEvents}</p>
      </div>
    </div>
  );
};

export default UserStats;
