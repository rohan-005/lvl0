import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import LoadingButton from "../../ui_components/LoadingButton";
import { Eye, EyeOff } from "lucide-react";

export default function Login({ onSwitch }) {
  const [data, setData] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(data.email, data.password);
    setLoading(false);

    if (!res.success) return toast.error(res.message);
    toast.success("Welcome back");
    navigate("/home");
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setData({ ...data, email: e.target.value })}
        required
      />
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

      <div className="auth-link">
        <Link to="/forgot-password">Forgot password?</Link>
      </div>
      

      <LoadingButton type="submit" loading={loading}>Login</LoadingButton>
      <p className="auth-link mobile-toggle">
        Don’t have an account?
        <span onClick={onSwitch}> Sign Up</span>
      </p>
    </form>
  );
}
