import React, { useEffect, useState } from 'react';
import './Rightslidebar.css';
import defaultProfile from './profile.avif';

function Rightslidebar() {
  const [friendIds, setFriendIds] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriendIds = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/user/friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = await res.json();
        setFriendIds(ids);
      } catch (err) {
        console.error('Failed to load friend IDs:', err);
      }
    };

    fetchFriendIds();
  }, []);

  useEffect(() => {
    // Jab friendIds update ho jaye, tab un IDs ka detail fetch karo
    if (friendIds.length === 0) return;

    const fetchFriendsDetails = async () => {
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

        if (!res.ok) throw new Error('Failed to fetch users');

        const data = await res.json();
        setFriends(data);  // yahan array of { fullName, profileImage, _id }
      } catch (err) {
        console.error('Failed to fetch users by ids:', err);
      }
    };

    fetchFriendsDetails();
  }, [friendIds]);

  return (
    <aside className="right-sidebar">
      <section className="friends-section">
        <h4 className="friends-title">Friends</h4>
        <ul className="friends-list">
          {friends.map(friend => (
            <li key={friend._id} className="friend-item">
              <div className="avatar">
                <img 
                  src={
                    friend.profileImage && friend.profileImage.trim() !== ''
                      ? `http://localhost:5000/uploads/${friend.profileImage}`
                      : defaultProfile
                  }
                  alt={`Avatar of ${friend.fullName}`}
                />
              </div>
              <span className="friend-name">{friend.fullName}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

export default Rightslidebar;
