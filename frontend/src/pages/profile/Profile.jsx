/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axiosConfig";
import { ArrowLeft, User, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import "../../css/profile.css";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* ================= SYNC USER ================= */
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  /* ================= ACTIONS ================= */
  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.put("/auth/profile", {
        name: profileForm.name,
      });

      updateUser(res.data.user || res.data);
      setMessage({ type: "success", text: "Profile updated" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage({ type: "success", text: "Password changed" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Password change failed",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-root">
      {/* HEADER */}
      <div className="profile-header glass-panel">
        <Link to="/home" className="back-link">
          <ArrowLeft size={18} /> Dashboard
        </Link>

        <div className="profile-title">ACCOUNT_SETTINGS</div>
      </div>

      <div className="profile-layout">
        {/* SIDEBAR */}
        <aside className="glass-panel profile-sidebar">
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.email}`}
            alt="avatar"
            className="avatar-img"
          />

          <div className="user-name">{user.name}</div>
          <div className="user-role">{user.role || "user"}</div>

          <div
            className={`nav-item ${tab === "profile" ? "active" : ""}`}
            onClick={() => setTab("profile")}
          >
            <User size={16} /> Profile
          </div>

          <div
            className={`nav-item ${tab === "password" ? "active" : ""}`}
            onClick={() => setTab("password")}
          >
            <Lock size={16} /> Password
          </div>
        </aside>

        {/* MAIN */}
        <main className="glass-panel profile-main">
          {message && (
            <div className={`alert ${message.type}`}>
              {message.text}
            </div>
          )}

          {tab === "profile" && (
            <form onSubmit={updateProfile} className="form">
              <label>FULL NAME</label>
              <input
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                required
              />

              <label>EMAIL</label>
              <input value={profileForm.email} disabled />

              <button disabled={loading}>
                {loading ? "UPDATING..." : "UPDATE_PROFILE"}
              </button>
            </form>
          )}

          {tab === "password" && (
            <form onSubmit={changePassword} className="form">
              <label>CURRENT PASSWORD</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                required
              />

              <label>NEW PASSWORD</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                required
              />

              <label>CONFIRM PASSWORD</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />

              <button disabled={loading}>
                {loading ? "CHANGING..." : "CHANGE_PASSWORD"}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
