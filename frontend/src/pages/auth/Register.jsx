import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingButton from "../../ui_components/LoadingButton";

export default function Register({ onSwitch }) {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    accountType: "gamer",
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirm)
      return toast.error("Passwords do not match");

    setLoading(true);
    const res = await register(
      data.name,
      data.email,
      data.password,
      data.accountType
    );
    setLoading(false);

    if (!res.success) return toast.error(res.message);
    toast.success("Verify your email");
    navigate("/verify-email", { state: { email: data.email } });
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h2>Register</h2>

      <input placeholder="Username" onChange={(e) => setData({ ...data, name: e.target.value })} required />
      <input type="email" placeholder="Email" onChange={(e) => setData({ ...data, email: e.target.value })} required />

      <div className="radio-group">
        <button type="button"
          className={`radio-btn ${data.accountType === "gamer" ? "active" : ""}`}
          onClick={() => setData({ ...data, accountType: "gamer" })}
        >
          🎮 Gamer
        </button>
        <button type="button"
          className={`radio-btn ${data.accountType === "developer" ? "active" : ""}`}
          onClick={() => setData({ ...data, accountType: "developer" })}
        >
          💻 Developer
        </button>
      </div>

      <input type="password" placeholder="Password" onChange={(e) => setData({ ...data, password: e.target.value })} required />
      <input type="password" placeholder="Confirm Password" onChange={(e) => setData({ ...data, confirm: e.target.value })} required />

      <LoadingButton type="submit" loading={loading}>Register</LoadingButton>
      <p className="auth-link mobile-toggle">
        Already have an account?
        <span onClick={onSwitch}> Sign In</span>
      </p>
    </form>
  );
}
