import React, { useState } from "react";
import axios from "axios";

const CreateRoomModal = ({ onClose, onRoomCreated }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("gamer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "https://lvl0.onrender.com"}/api/chat/rooms`,
        { name: name.trim(), category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onRoomCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-modal-overlay">
      <div className="room-modal-content">
        <h3>Create New Channel</h3>
        <p>Channels are persistent spaces where anyone can chat.</p>

        {error && <div className="room-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Channel Name</label>
            <div className="input-wrapper">
              <span className="hash-prefix">#</span>
              <input 
                type="text" 
                maxLength="30"
                placeholder="e.g. speedrunning"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="gamer">🎮 Gamer Lounge</option>
              <option value="developer">💻 Dev Spaces</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-create" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
