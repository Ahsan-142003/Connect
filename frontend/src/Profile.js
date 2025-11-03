import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import './Profile.css';
import NavBar from "./MyComponents/NavBar";
import { Carousel } from 'react-bootstrap';

const Profile = () => {
  const [imagePreview, setImagePreview] = useState("https://via.placeholder.com/150");
  const [user, setUser] = useState({});
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    dateOfBirth: "",
    about: "",
    registrationNo: ""
  });

  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [postImages, setPostImages] = useState([]);

  const [userPosts, setUserPosts] = useState([]);

  // Get userId from user state to fetch posts
  const userId = user._id;

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        setFormData({
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth || "",
          about: data.about || "",
          registrationNo: data.registrationNo || "",
        });
        if (data.profileImage) {
          setImagePreview(`http://localhost:5000/uploads/${data.profileImage}`);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch posts of logged-in user
  useEffect(() => {
    if (!userId) return;

    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts || []);
          setUserPosts(data.posts || []);
        } else {
          console.error("Failed to fetch user posts:", data.message);
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
      }
    };

    fetchUserPosts();
  }, [userId]);

  // Max date for DOB input (18 years ago)
  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split("T")[0];
  };

  // Handle profile image change
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("profileImage", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/upload/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Image uploaded!");
        setImagePreview(`http://localhost:5000/uploads/${data.user.profileImage}`);
        setUser(data.user);
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // Trigger hidden file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Handle form data change
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle post images selection
  const handlePostImagesChange = (e) => {
    setPostImages(Array.from(e.target.files));
  };

  // Handle new post submission
  const handlePostSubmit = async () => {
    if (!postText.trim()) {
      alert("Post content can't be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("userId", user._id);
      formDataToSend.append("text", postText);
      postImages.forEach((imgFile) => {
        formDataToSend.append("images", imgFile);
      });

      const res = await fetch("http://localhost:5000/api/posts/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Post created!");
        setPostText("");
        setPostImages([]);
        setPosts(prev => [data, ...prev]);
        setUserPosts(prev => [data, ...prev]);
      } else {
        alert(data.message || "Failed to create post");
      }
    } catch (err) {
      console.error("Post creation error:", err);
    }
  };

  return (
    <>
      <NavBar />
      <br />
      <br />
      <div className="container">
        <div className="profile-card">
          <div className="profile-img-container" style={{ position: "relative" }}>
            <img
              src={imagePreview}
              alt="Profile"
              className="profile-img"
              style={{ borderRadius: "50%", width: "150px", height: "150px", objectFit: "cover" }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <button className="change-photo-btn" style={{ marginTop: "10px" }} onClick={handleButtonClick}>
              Change Profile Picture
            </button>
          </div>
          <div className="profile-info">
            <h2>{user.fullName || "Ben Goro"}</h2>
            <p>367 Friends</p>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Basic Info</h3>
            {editing ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch("http://localhost:5000/api/user/update-profile", {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(formData),
                    });

                    const data = await res.json();
                    if (res.ok) {
                      alert("Profile updated");
                      setUser(data.user);
                      setEditing(false);
                    } else {
                      alert(data.message || "Update failed");
                    }
                  } catch (err) {
                    console.error("Update failed:", err);
                  }
                }}
              >
                <label>
                  Phone:
                  <input
                    type="number"
                    min="0"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (/^\d+$/.test(val) && Number(val) >= 0)) {
                        handleFormChange("phone", val);
                      }
                    }}
                  />
                </label>
                <br />
                <label>
                  Registration Number:
                  <input
                    type="text"
                    value={formData.registrationNo}
                    onChange={(e) => handleFormChange("registrationNo", e.target.value)}
                  />
                </label>
                <br />
                <label>
                  Date of Birth:
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    max={getMaxDate()}
                    onChange={(e) => handleFormChange("dateOfBirth", e.target.value)}
                  />
                </label>
                <br />
                <label>
                  About:
                  <textarea
                    value={formData.about}
                    onChange={(e) => handleFormChange("about", e.target.value)}
                  />
                </label>
                <br />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditing(false)}>Cancel</button>
              </form>
            ) : (
              <>
                <ul>
                  <li><strong>Phone:</strong> {user.phone || "Not set"}</li>
                  <li><strong>Email:</strong> {user.email || "Not set"}</li>
                  <li><strong>Registration No:</strong> {user.registrationNo || "Not set"}</li>
                  <li><strong>Date of Birth:</strong> {user.dateOfBirth || "Not set"}</li>
                  <li><strong>About:</strong> {user.about || "Not set"}</li>
                  <li><strong>CV:</strong> <a href={`http://localhost:5000/uploads/${user.cv}`} target="_blank" rel="noreferrer">Download CV</a></li>
                </ul>
                <button onClick={() => setEditing(true)}>Edit Profile</button>
              </>
            )}
          </div>

          <div className="card">
            <h3>Create New Post</h3>
            <textarea
              rows={3}
              placeholder="What's on your mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePostImagesChange}
            />
            <br />
            <button onClick={handlePostSubmit} style={{ marginTop: "10px" }}>
              Post
            </button>
          </div>
        </div>

        <h3>Your Posts</h3>
        {posts.length === 0 && <p>No posts yet</p>}
        {posts.map((post) => (
          <div key={post._id} className="post-card">
            <div className="post-header">
              <img
                src={user.profileImage ? `http://localhost:5000/uploads/${user.profileImage}` : "https://via.placeholder.com/40"}
                alt="User"
                className="post-profile-pic"
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div className="post-user-info">
                <strong>{user.fullName || "Ben Goro"}</strong>
                <span className="post-time">
                  {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ""}
                </span>
              </div>
            </div>

            <div className="post-content">
              <p>{post.text}</p>

              {post.images && post.images.length > 0 && (
                <Carousel>
                  {post.images.map((imgUrl, i) => (
                    <Carousel.Item key={i}>
                      <img
                        className="d-block w-100"
                        src={`http://localhost:5000/uploads/${imgUrl}`}
                        alt={`Slide ${i + 1}`}
                        style={{ maxHeight: "400px", objectFit: "contain" }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              )}
            </div>

            {/* Added Like, Comment, Share section */}
            <div className="post-actions" style={{ marginTop: "10px", borderTop: "1px solid #ccc", paddingTop: "10px", display: "flex", justifyContent: "space-around" }}>
              <button className="like-btn">👍 Like ({post.likesCount || 0})</button>
              <button className="comment-btn">💬 Comment ({post.commentsCount || 0})</button>
              <button className="share-btn">🔄 Share ({post.sharesCount || 0})</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Profile;
