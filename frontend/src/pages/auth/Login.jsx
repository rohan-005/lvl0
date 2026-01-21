import React, { useState } from "react";
import "../../css/auth.css";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (!res.success) return toast.error(res.message);
    toast.success("Access granted");

    navigate("/dashboard");
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">lvl_0</div>
        <div className="auth-sub">Sign in to continue</div>

        <form onSubmit={submit}>
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button className="auth-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="auth-link">
          Forgot access? <Link to="/forgot-password">Recover</Link>
        </div>
        <div className="auth-link">
          New user? <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}
