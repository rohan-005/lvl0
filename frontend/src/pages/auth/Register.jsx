import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingButton from "../../ui_components/LoadingButton";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

      <div className="password-input-wrapper" style={{ position: "relative", width: "100%" }}>
        <input 
          type={showPassword ? "text" : "password"} 
          placeholder="Password" 
          onChange={(e) => setData({ ...data, password: e.target.value })} 
          required 
          style={{ width: "100%" }}
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)}
          style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="password-input-wrapper" style={{ position: "relative", width: "100%" }}>
        <input 
          type={showConfirm ? "text" : "password"} 
          placeholder="Confirm Password" 
          onChange={(e) => setData({ ...data, confirm: e.target.value })} 
          required 
          style={{ width: "100%" }}
        />
        <button 
          type="button" 
          onClick={() => setShowConfirm(!showConfirm)}
          style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <LoadingButton type="submit" loading={loading}>Register</LoadingButton>
      <p className="auth-link mobile-toggle">
        Already have an account?
        <span onClick={onSwitch}> Sign In</span>
      </p>
    </form>
  );
}
