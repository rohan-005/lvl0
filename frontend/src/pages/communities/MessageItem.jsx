import React, { useState } from "react";

const MessageItem = ({ message, isOwn, showAvatar, socket, currentUserRole }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const isMod = currentUserRole === "admin" || currentUserRole === "moderator";
  
  // Format time (e.g., Today at 2:30 PM, or just 14:30)
  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const handleVote = (type) => {
    socket.emit("message:vote", { messageId: message._id, type });
  };

  const handleReact = (emoji) => {
    socket.emit("message:react", { messageId: message._id, emoji });
    setShowPicker(false);
  };

  const handleModerate = (action) => {
    if (window.confirm(`Are you sure you want to ${action} this message?`)) {
      socket.emit("message:moderate", { messageId: message._id, action });
    }
  };

  return (
    <div className={`message-item ${isOwn ? "message-own" : ""} ${!showAvatar ? "message-sequential" : ""}`}>
      {/* LEFT: Avatar or Voting Arrow Stack */}
      <div className="message-left">
        {showAvatar ? (
          <div className="message-avatar">
            {message.avatar ? (
              <img src={message.avatar} alt="avatar" />
            ) : (
              <span>{message.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
        ) : (
          <div className="message-spacer">
            <span className="msg-time-hover">{formatTime(message.createdAt)}</span>
          </div>
        )}
      </div>

      {/* RIGHT: Content */}
      <div className="message-right">
        {showAvatar && (
          <div className="message-meta">
            <span className="msg-username">{message.username}</span>
            <span className="msg-time">{formatTime(message.createdAt)}</span>
            {message.pinned && <span className="msg-pinned-badge">📌 Pinned</span>}
          </div>
        )}

        <div className="message-body">
          {message.message && <p>{message.message}</p>}
          
          {message.attachmentUrl && (
            <div className="message-attachment">
              {message.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${message.attachmentUrl}`} 
                  alt="attachment" 
                  loading="lazy" 
                />
              ) : message.attachmentUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video 
                  controls 
                  src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${message.attachmentUrl}`} 
                />
              ) : (
                <a href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${message.attachmentUrl}`} target="_blank" rel="noreferrer" className="attachment-link">
                  📎 View Attachment
                </a>
              )}
            </div>
          )}

          {/* Reaction & Action Bar */}
          <div className="message-actions-bar">
            
            {/* Voting (Reddit style) */}
            <div className="vote-controls">
              <button className="vote-btn up" onClick={() => handleVote("up")}>▲</button>
              <span className="vote-score">{message.upvotes - message.downvotes}</span>
              <button className="vote-btn down" onClick={() => handleVote("down")}>▼</button>
            </div>

            {/* Existing Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="reactions-list">
                {message.reactions.map(r => (
                  <button 
                    key={r.emoji} 
                    className="reaction-pill"
                    onClick={() => handleReact(r.emoji)}
                  >
                    <span>{r.emoji}</span> {r.userIds.length}
                  </button>
                ))}
              </div>
            )}

            {/* Add Reaction Button */}
            <div className="add-reaction-wrapper">
              <button 
                className="add-reaction-btn" 
                onClick={() => setShowPicker(!showPicker)}
              >
                +☻
              </button>
              {showPicker && (
                <div className="emoji-picker-dropdown">
                  {["🔥", "😂", "👍", "❤️", "🎮", "👀"].map(e => (
                    <span key={e} onClick={() => handleReact(e)}>{e}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Mod Controls */}
            {isMod && (
              <div className="mod-actions">
                <button onClick={() => handleModerate("pin")} className="mod-btn pin-btn">📌</button>
                <button onClick={() => handleModerate("delete")} className="mod-btn del-btn">🗑</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
