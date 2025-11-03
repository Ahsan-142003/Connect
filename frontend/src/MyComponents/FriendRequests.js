import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Image, Spinner } from 'react-bootstrap';
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/user/friend-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRequests(res.data);
        setLoading(false);

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.userId;
        socket.emit("join", userId);

        // Listen for real-time friend requests
        socket.on("new-friend-request", (newRequest) => {
          setRequests((prev) => {
            // Avoid duplicates
            if (prev.some(r => r._id === newRequest._id)) return prev;
            return [...prev, newRequest];
          });
        });

      } catch (err) {
        console.error("Failed to fetch friend requests:", err);
        setLoading(false);
      }
    };

    fetchRequests();

    return () => {
      socket.off("new-friend-request");
    };
  }, []);

  const respondToRequest = async (senderId, action) => {
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:5000/api/user/${action}-request/${senderId}`;
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((u) => u._id !== senderId));
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Friend Requests</h3>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : requests.length === 0 ? (
        <p>No pending friend requests.</p>
      ) : (
        requests.map((user) => (
          <Card key={user._id} className="p-3 mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <Image
                  src={`http://localhost:5000/uploads/${user.profileImage}`}
                  roundedCircle
                  width={50}
                  height={50}
                />
                <span className="ms-3 fw-bold">{user.fullName}</span>
              </div>
              <div>
                <Button className="me-2" onClick={() => respondToRequest(user._id, "accept")}>
                  Accept
                </Button>
                <Button variant="danger" onClick={() => respondToRequest(user._id, "reject")}>
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default FriendRequests;
