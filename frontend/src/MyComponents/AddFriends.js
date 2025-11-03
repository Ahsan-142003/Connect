import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Card, Image, Button } from "react-bootstrap";
import { FaUserPlus } from "react-icons/fa";
import NavBar from "./NavBar";

import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

const AddFriends = ({ currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState({}); // Sent requests map
  const [incomingRequests, setIncomingRequests] = useState([]); // Received friend requests

  // Join socket once on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;
      socket.emit("join", userId);
    }

    // Listen for new incoming friend requests via socket
    socket.on("new-friend-request", (newRequest) => {
      setIncomingRequests((prev) => [...prev, newRequest]);
    });

    return () => {
      socket.off("new-friend-request");
      socket.disconnect();
    };
  }, []);

  // Load all users + sent requests + incoming requests
  useEffect(() => {
    if (!currentUserId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [allUsersRes, sentReqRes, friendsRes, incomingReqRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/user/all", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/user/sent-requests", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/user/friends", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/user/friend-requests", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const sentRequestIds = sentReqRes.data;
        const friendIds = friendsRes.data;
        const incomingRequestsList = incomingReqRes.data;

        // Filter users to show only those who are not friends or already sent requests
        const filteredUsers = allUsersRes.data.filter(
          (user) =>
            !sentRequestIds.includes(user._id) &&
            !friendIds.includes(user._id) &&
            !incomingRequestsList.find((r) => r._id === user._id) // Also exclude incoming requests users here
        );

        setUsers(filteredUsers);

        // Map for quick check if request sent
        const requestsMap = {};
        sentRequestIds.forEach((id) => (requestsMap[id] = true));
        setFriendRequests(requestsMap);

        setIncomingRequests(incomingRequestsList);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchData();
  }, [currentUserId]);

  // Send a friend request
  const handleSendRequest = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/user/send-request/${receiverId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Friend request sent!");
      setFriendRequests((prev) => ({ ...prev, [receiverId]: true }));
      setUsers((prev) => prev.filter((user) => user._id !== receiverId));
    } catch (err) {
      alert("Failed to send request");
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (senderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/user/accept-request/${senderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Friend request accepted!");
      setIncomingRequests((prev) => prev.filter((r) => r._id !== senderId));
    } catch (err) {
      alert("Failed to accept request");
    }
  };

  // Reject friend request
  const handleRejectRequest = async (senderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/user/reject-request/${senderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Friend request rejected!");
      setIncomingRequests((prev) => prev.filter((r) => r._id !== senderId));
    } catch (err) {
      alert("Failed to reject request");
    }
  };

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <br />
        <br />
        <h3 className="mb-4">Incoming Friend Requests</h3>
        {incomingRequests.length === 0 && <p>No incoming friend requests.</p>}
        {incomingRequests.map((user) => (
          <Card key={user._id} className="p-3 mb-3 shadow-sm">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <Image
                  src={`http://localhost:5000/uploads/${user.profileImage}`}
                  roundedCircle
                  width={50}
                  height={50}
                  className="me-3"
                />
                <span className="fw-bold">{user.fullName}</span>
              </div>
              <div>
                <Button
                  className="me-2"
                  onClick={() => handleAcceptRequest(user._id)}
                  variant="success"
                >
                  Accept
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleRejectRequest(user._id)}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <h3 className="mb-4 mt-5">Add Friends</h3>
        <Row>
          {users.length === 0 && <p>No users available to add as friends.</p>}
          {users.map((user) => (
            <Col key={user._id} md={4} sm={6} className="mb-3">
              <Card className="p-3 shadow-sm h-100">
                <div className="d-flex align-items-center">
                  <Image
                    src={`http://localhost:5000/uploads/${user.profileImage}`}
                    roundedCircle
                    width={60}
                    height={60}
                    className="me-3"
                  />
                  <div>
                    <h5 className="mb-0">{user.fullName}</h5>
                    <small className="text-muted">{user.userType}</small>
                  </div>
                </div>
                <div className="mt-3 text-end">
                  <Button
                    variant="outline-primary"
                    onClick={() => handleSendRequest(user._id)}
                    disabled={friendRequests[user._id]}
                  >
                    <FaUserPlus />{" "}
                    {friendRequests[user._id] ? "Request Sent" : "Add Friend"}
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default AddFriends;
