import React, { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import ChatArea from "./ChatArea";
import "../../css/communities.css";

const GAMER_CHANNELS = ["General", "Action", "RPG", "FPS", "Indie"];
const DEV_CHANNELS = ["General", "Unity", "Unreal Engine", "WebGL", "Indie Dev"];

const Communities = () => {
  const socket = useSocket();
  const { user } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState("gamer"); // 'gamer' || 'developer'
  const [activeChannel, setActiveChannel] = useState("General");
  
  const [onlineUsers, setOnlineUsers] = useState([]); // Mock or real

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
            <h3 onClick={() => setActiveCategory("gamer")} className={activeCategory === "gamer" ? "active-cat" : ""}>
              🎮 GAMER LOUNGE
            </h3>
            {activeCategory === "gamer" && (
              <ul className="channel-list">
                {GAMER_CHANNELS.map(ch => (
                  <li 
                    key={ch} 
                    className={activeChannel === ch ? "active-channel" : ""}
                    onClick={() => setActiveChannel(ch)}
                  >
                    # {ch.toLowerCase()}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="channel-group">
            <h3 onClick={() => setActiveCategory("developer")} className={activeCategory === "developer" ? "active-cat" : ""}>
              💻 DEV SPACES
            </h3>
            {activeCategory === "developer" && (
              <ul className="channel-list">
                {DEV_CHANNELS.map(ch => (
                  <li 
                    key={ch} 
                    className={activeChannel === ch ? "active-channel" : ""}
                    onClick={() => setActiveChannel(ch)}
                  >
                    # {ch.toLowerCase().replace(" ", "-")}
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
    </div>
  );
};

export default Communities;
