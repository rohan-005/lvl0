import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import ChatArea from "./ChatArea";
import CreateRoomModal from "./CreateRoomModal";
import "../../css/communities.css";

const Communities = () => {
  const socket = useSocket();
  const { user } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState("gamer"); // 'gamer' || 'developer'
  const [activeChannel, setActiveChannel] = useState("general");
  const [rooms, setRooms] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch Rooms & Directory Users
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const [roomsRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL || "https://lvl0.onrender.com"}/api/chat/rooms`, { headers }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL || "https://lvl0.onrender.com"}/api/chat/users`, { headers })
        ]);
        
        setRooms(roomsRes.data);
        setDirectoryUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to fetch chat data", err);
      }
    };
    fetchRooms();
  }, []);

  const filteredUsers = directoryUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const getAvatar = (u) => {
    const seed = u?.email || u?.name || "guest";
    let style  = "identicon";
    if (u?.accountType === "developer") style = "bottts-neutral";
    else if (u?.accountType === "gamer") style = "pixel-art";
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  };

  useEffect(() => {
    if (!socket) return;
    
    // Join room when category/channel changes
    socket.emit("room:join", { roomId: activeCategory, channel: activeChannel.toLowerCase() });

    // Handle typing or users joining if backend supported it fully, 
    // for now we just handle the socket room join.

    return () => {
      socket.emit("room:leave", { roomId: activeCategory, channel: activeChannel.toLowerCase() });
    };
  }, [socket, activeCategory, activeChannel]);

  return (
    <div className="communities-page">
      <div className="chat-layout bento-card">
        
        {/* LEFT SIDEBAR: CHANNELS */}
        <div className="chat-sidebar-left">
          <div className="chat-brand">
            <h2>COMMUNITIES</h2>
          </div>
          
          <div className="channel-group">
            <div className="channel-group-header">
              <h3 onClick={() => setActiveCategory("gamer")} className={activeCategory === "gamer" ? "active-cat" : ""}>
                🎮 GAMER LOUNGE
              </h3>
              <button className="add-room-btn" onClick={() => { setActiveCategory("gamer"); setShowModal(true); }}>+</button>
            </div>
            {activeCategory === "gamer" && (
              <ul className="channel-list">
                {rooms.filter(r => r.category === "gamer").map(room => (
                  <li 
                    key={room._id} 
                    className={activeChannel === room.name.toLowerCase() ? "active-channel" : ""}
                    onClick={() => setActiveChannel(room.name.toLowerCase())}
                  >
                    # {room.name.toLowerCase()}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="channel-group">
            <div className="channel-group-header">
              <h3 onClick={() => setActiveCategory("developer")} className={activeCategory === "developer" ? "active-cat" : ""}>
                💻 DEV SPACES
              </h3>
              <button className="add-room-btn" onClick={() => { setActiveCategory("developer"); setShowModal(true); }}>+</button>
            </div>
            {activeCategory === "developer" && (
              <ul className="channel-list">
                {rooms.filter(r => r.category === "developer").map(room => (
                  <li 
                    key={room._id} 
                    className={activeChannel === room.name.toLowerCase() ? "active-channel" : ""}
                    onClick={() => setActiveChannel(room.name.toLowerCase())}
                  >
                    # {room.name.toLowerCase()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CENTER: CHAT AREA */}
        <div className="chat-center">
          <ChatArea 
            roomId={activeCategory} 
            channel={activeChannel.toLowerCase().replace(" ", "-")} 
          />
        </div>

        {/* RIGHT SIDEBAR: ACTIVE USERS */}
        <div className="chat-sidebar-right">
          <div className="sidebar-header">
            <h3>MEMBERS — {filteredUsers.length}</h3>
          </div>

          <div className="dm-search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search to DM..." 
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="dm-search-input"
            />
          </div>

          <div className="active-users-list">
            <h4 className="directory-subheader">YOU</h4>
            <div className="user-row sticky-user">
              <div className="user-avatar default-avatar">
                {user ? <img src={getAvatar(user)} alt="avatar" /> : "U"}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || "Guest"}</span>
                <span className="user-role">{user?.role || "user"}</span>
              </div>
            </div>

            <h4 className="directory-subheader mt-4">RECENTLY JOINED</h4>
            {filteredUsers.filter(u => u._id !== user?._id).map(u => (
              <div className="user-row directory-user" key={u._id} onClick={() => alert(`Direct Messaging features coming soon to chat with ${u.name}!`)}>
                <div className="user-avatar">
                  <img src={getAvatar(u)} alt="avatar" />
                  <div className={`status-dot ${u.role === "admin" ? "admin" : ""}`}></div>
                </div>
                <div className="user-info">
                  <span className="user-name">{u.name}</span>
                  <span className="user-role">{u.accountType === "developer" ? "Developer" : "Gamer"}</span>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="directory-empty">No users found.</div>
            )}
          </div>
        </div>

      </div>

      {showModal && (
        <CreateRoomModal 
          onClose={() => setShowModal(false)} 
          onRoomCreated={(newRoom) => {
            setRooms(prev => [...prev, newRoom]);
            setShowModal(false);
            setActiveCategory(newRoom.category);
            setActiveChannel(newRoom.name.toLowerCase());
          }} 
        />
      )}
    </div>
  );
};

export default Communities;
