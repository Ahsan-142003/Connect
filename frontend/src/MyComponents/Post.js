import React, { useEffect, useState } from "react";
import { Card, Button, Form, Carousel } from "react-bootstrap";
import { FaRegThumbsUp, FaRegComment, FaShare, FaGlobeAmericas } from "react-icons/fa";
import axios from "axios";
import "./Post.css";

// Post Actions
const PostActions = () => (
  <div className="post-actions">
    <Button variant="link" className="post-action"><FaRegThumbsUp /> Like</Button>
    <Button variant="link" className="post-action"><FaRegComment /> Comment</Button>
    <Button variant="link" className="post-action"><FaShare /> Share</Button>
  </div>
);

// Individual Post
const PostItem = ({ user, createdAt, text, images }) => {
  const profileImgSrc = user?.profileImage
    ? `http://localhost:5000/uploads/${user.profileImage}`
    : "https://via.placeholder.com/40";

  return (
    <Card className="mb-4 post-card">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            <img src={profileImgSrc} alt="profile" className="profile-img" />
            <div className="ms-2">
              <strong>{user?.fullName || user?.username || "Unknown User"}</strong>
              <div className="text-muted small">
                {new Date(createdAt).toLocaleString()} <FaGlobeAmericas className="ms-1" size={10} />
              </div>
            </div>
          </div>
        </div>

        <p className="post-content">{text}</p>

        {images && images.length > 0 && (
          <div className="post-media-container mb-3">
            {images.length === 1 ? (
              <img
                className="post-media"
                src={`http://localhost:5000/uploads/${images[0]}`}
                alt="Post Media"
              />
            ) : (
              <Carousel indicators={false} interval={null}>
                {images.map((img, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="post-media"
                      src={`http://localhost:5000/uploads/${img}`}
                      alt={`Slide ${index}`}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            )}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center border-top border-bottom py-2 mb-2">
          <div className="text-muted small"><FaRegThumbsUp className="text-primary" /> 230</div>
          <div className="text-muted small">12 comments • 2 shares</div>
        </div>

        <PostActions />
      </Card.Body>
    </Card>
  );
};

// Main Post Feed
const Post = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
  const fetchFriendsPosts = async () => {
    try {
      // Get currentUserId from localStorage or wherever you store user info
      const currentUser = JSON.parse(localStorage.getItem("user")); 
      const userId = currentUser?._id;

      if (!userId) {
        setLoading(false);
        return;
      }

      // Pass userId as query param, no auth headers
      const res = await axios.get(`http://localhost:5000/api/posts/friends-posts?userId=${userId}`);

      const fetchedPosts = Array.isArray(res.data) ? res.data : res.data.posts || [];
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchFriendsPosts();
}, []);


  return (
    <div className="post-container">
      {/* Input Box */}
      <Card className="mb-4 post-card-1">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center mb-3">
            <img
              src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=1000&q=80"
              alt="profile"
              className="profile-img"
            />
            <Form.Control className="ms-2 post-input" placeholder="What's on your mind?" />
          </div>
          <div className="d-flex justify-content-between border-top pt-3">
            <Button variant="light" className="post-action-btn">
              <i className="bi bi-camera-fill text-danger me-1"></i> Photo
            </Button>
            <Button variant="light" className="post-action-btn">
              <i className="bi bi-emoji-smile text-warning me-1"></i> Feeling
            </Button>
            <Button variant="light" className="post-action-btn">
              <i className="bi bi-three-dots text-muted"></i> Jobs
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Render Posts */}
      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length > 0 ? (
        posts.map((post) => <PostItem key={post._id} {...post} />)
      ) : (
        <p>No posts to show.</p>
      )}
    </div>
  );
};

export default Post;
