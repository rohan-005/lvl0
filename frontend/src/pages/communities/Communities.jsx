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
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || "https://lvl0.onrender.com"}/api/chat/rooms`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      }
    };
    fetchRooms();
  }, []);

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
            <h3>ONLINE — {onlineUsers.length || 1}</h3>
          </div>
          <div className="active-users-list">
            <div className="user-row">
              <div className="user-avatar default-avatar">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || "You"}</span>
                <span className="user-role">{user?.role || "user"}</span>
              </div>
            </div>
            {/* Additional mock users could map here */}
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
