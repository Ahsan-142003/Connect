import React, { useEffect, useState } from "react";
import { Card, Button, InputGroup, Form, Image, Badge } from "react-bootstrap";
import { 
  FiSearch, FiMoreVertical, FiPaperclip, 
  FiSmile, FiFile
} from "react-icons/fi";
import { BsCheck2All, BsThreeDotsVertical } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import "./Mxg.css";
import defaultProfile from './profile.avif';

// Initialize Socket.IO client
const socket = io("http://localhost:5000");

const Mxg = () => {
 const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [friends, setFriends] = useState([]);
 const senderId = localStorage.getItem("userId"); // Get the logged-in user ID from storage
  const receiverId = "USER_ID_YOU_CLICKED"; // Placeholder for selected chat user ID



  useEffect(() => {
  const fetchFriendIds = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/user/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = await res.json();
      setFriendIds(ids); // ✅ Now friendIds will be populated
    } catch (err) {
      console.error("Error fetching friend IDs:", err);
    }
  };

  fetchFriendIds();
}, []);


  useEffect(() => {
    // Fetch friend details
    const fetchFriendDetails = async () => {
      if (friendIds.length === 0) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/user/users-by-ids', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: friendIds }),
        });
        const data = await res.json();
        setFriends(data);
      } catch (err) {
        console.error("Error fetching friend details:", err);
      }
    };

    fetchFriendDetails();
  }, [friendIds]);




  useEffect(() => {
    // Join the chat on component mount
    socket.emit("join", senderId);

    // Listen for incoming messages
    socket.on("receive-message", ({ senderId, message }) => {
      setMessages((prev) => [...prev, { senderId, message }]);
    });

    // Cleanup on unmount
    return () => socket.disconnect();
  }, [senderId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Emit message to the server
      socket.emit("private-message", { senderId, receiverId, message });
      // Update the local message list
      setMessages((prev) => [...prev, { senderId, message }]);
      setMessage(""); // Clear the input field
    }
  };

  return (
    <div className="chat-app-container">
      {/* Left Sidebar */}
      <div className="app-sidebar">
        <div className="app-header">
          <div className="d-flex align-items-center" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
            <h4 className="app-title">Connect Guru</h4>
          </div>
          <div className="app-actions">
            <div className="user-avatar">
              <Image src="https://randomuser.me/api/portraits/women/44.jpg" roundedCircle />
            </div>
          </div>
        </div>

        <div className="search-container">
          <InputGroup>
            <InputGroup.Text className="search-icon">
              <FiSearch />
            </InputGroup.Text>
            <Form.Control placeholder="Search friends..." className="search-input" />
          </InputGroup>
        </div>
        <br />

        {/* Friends List */}
        <div className="chat-list">
          {friends.map(friend => (
            <div className="chat-item" key={friend._id}>
              <div className="chat-avatar">
                <Image
                  src={
                    friend.profileImage && friend.profileImage.trim() !== ""
                      ? `http://localhost:5000/uploads/${friend.profileImage}`
                      : defaultProfile
                  }
                  roundedCircle
                />
                <span className="online-status"></span>
              </div>
              <div className="chat-info">
                <div className="d-flex justify-content-between">
                  <h6>{friend.fullName}</h6>
                  <span className="time">Online</span>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="chat-preview">Say hi 👋</p>
                  {/* <Badge bg="primary" className="unread-count">1</Badge> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-partner">
            <div className="chat-avatar">
              <Image src="https://randomuser.me/api/portraits/women/1.jpg" roundedCircle />
              <span className="online-status"></span>
            </div>
            <div className="partner-info">
              <h5>Ava Thompson</h5>
              <p className="status">Online</p>
            </div>
          </div>
          <div className="chat-actions">
            <Button variant="light" className="action-btn">
              <FiMoreVertical />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.senderId === senderId ? "sent" : "received"}`}>
              <div className="message-content">
                <p>{msg.message}</p>
                <div className="message-time">12:30 PM</div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="message-input">
          <Button variant="light" className="input-action">
            <FiPaperclip />
          </Button>
          <div className="file-options">
            <Button variant="light"><FiFile /></Button>
          </div>
          <Form.Control 
            as="textarea" 
            rows={1} 
            placeholder="Type a message..." 
            className="message-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="primary" className="send-btn" onClick={handleSendMessage}>
            <IoMdSend />
          </Button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="chat-details">
        <div className="details-header">
          <h5>Chat Details</h5>
        </div>
        <div className="user-profile">
          <div className="profile-avatar">
            <Image src="https://randomuser.me/api/portraits/women/1.jpg" roundedCircle />
            <span className="online-status"></span>
          </div>
          <h5>Ava Thompson</h5>
          <Button variant="outline-primary" className="profile-btn">View Profile</Button>
        </div>
        <div className="details-section">
          <h6>Shared Media</h6>
          <div className="shared-media">
            <Image src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" rounded />
            <Image src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" rounded />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mxg;
