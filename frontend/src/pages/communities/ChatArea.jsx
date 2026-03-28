import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import MessageItem from "./MessageItem";
import axios from "axios";

const ChatArea = ({ roomId, channel }) => {
  const socket = useSocket();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [inputText, setInputText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/chat/${roomId}/${channel}?limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages || []);
        setPinned(res.data.pinnedMessages || []);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [roomId, channel]);

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom(); // Auto scroll on new message
    };

    const handleUpdate = (updatedMsg) => {
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
      if (updatedMsg.pinned) {
        setPinned(prev => {
          if (!prev.find(p => p._id === updatedMsg._id)) return [...prev, updatedMsg];
          return prev;
        });
      } else {
        setPinned(prev => prev.filter(p => p._id !== updatedMsg._id));
      }
    };

    const handleDelete = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
      setPinned(prev => prev.filter(p => p._id !== messageId));
    };

    const handleTyping = ({ userId, username }) => {
      if (userId === user?._id) return;
      setTypingUsers(prev => ({ ...prev, [userId]: username }));
    };

    const handleStopTyping = ({ userId }) => {
      setTypingUsers(prev => {
        const clone = { ...prev };
        delete clone[userId];
        return clone;
      });
    };

    socket.on("message:receive", handleReceive);
    socket.on("message:update", handleUpdate);
    socket.on("message:delete", handleDelete);
    socket.on("user:typing", handleTyping);
    socket.on("user:stopTyping", handleStopTyping);

    return () => {
      socket.off("message:receive", handleReceive);
      socket.off("message:update", handleUpdate);
      socket.off("message:delete", handleDelete);
      socket.off("user:typing", handleTyping);
      socket.off("user:stopTyping", handleStopTyping);
    };
  }, [socket, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !socket) return;

    let attachmentUrl = null;

    if (selectedFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("attachment", selectedFile);
      
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/chat/upload`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
        attachmentUrl = res.data.url;
      } catch (err) {
        console.error("Upload failed", err);
        setUploading(false);
        return; // Halt send on failure
      }
      setUploading(false);
      setSelectedFile(null);
    }

    socket.emit("message:send", {
      roomId,
      channel,
      messageText: inputText,
      attachmentUrl
    });

    setInputText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    socket.emit("typing:stop", { roomId, channel });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };


  const handleTyping = (e) => {
    setInputText(e.target.value);
    
    if (socket) {
      socket.emit("typing:start", { roomId, channel });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing:stop", { roomId, channel });
      }, 2000);
    }
  };

  const typingNames = Object.values(typingUsers);

  return (
    <div className="chat-area-container">
      {/* HEADER */}
      <div className="chat-header">
        <span className="hash">#</span>
        <h3>{channel}</h3>
        {pinned.length > 0 && (
          <div className="pinned-indicator">
            📌 {pinned.length} Pinned
          </div>
        )}
      </div>

      {/* PINNED MESSAGES BAR */}
      {pinned.length > 0 && (
        <div className="pinned-bar">
          <span className="pin-icon">📌</span>
          <p>{pinned[0].message}</p>
          {pinned.length > 1 && <span>(+{pinned.length - 1} more)</span>}
        </div>
      )}

      {/* MESSAGES FEED */}
      <div className="messages-feed" ref={scrollContainerRef}>
        {loading && <div className="chat-loader">Loading history...</div>}
        
        {messages.map((msg, idx) => {
          const isOwn = msg.userId === user?._id;
          // Determine if we show avatar (hide if sequential from same user)
          const showAvatar = idx === 0 || messages[idx - 1].userId !== msg.userId;

          return (
            <MessageItem 
              key={msg._id || idx} 
              message={msg} 
              isOwn={isOwn} 
              showAvatar={showAvatar}
              socket={socket}
              currentUserRole={user?.role}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="chat-input-zone">
        {typingNames.length > 0 && (
          <div className="typing-indicator">
            {typingNames.join(", ")} {typingNames.length > 1 ? "are" : "is"} typing...
          </div>
        )}
        
        {selectedFile && (
          <div className="attachment-preview">
            <span>📎 {selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)}>×</button>
          </div>
        )}

        <form onSubmit={handleSend} className="chat-input-form">
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*,video/*"
            onChange={handleFileSelect}
          />
          <button 
            type="button" 
            className="btn-attach" 
            onClick={() => fileInputRef.current?.click()}
          >
            📎
          </button>
          
          <input 
            type="text" 
            placeholder={`Message #${channel}...`} 
            value={inputText}
            onChange={handleTyping}
            disabled={uploading}
          />
          <button type="submit" disabled={(!inputText.trim() && !selectedFile) || uploading}>
            {uploading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
