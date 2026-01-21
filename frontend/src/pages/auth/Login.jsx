import React, { useState } from "react";
import "../../css/auth.css";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import LoadingButton from "../../ui_components/LoadingButton";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (!res.success) return toast.error(res.message);

    toast.success("Access granted");
    navigate("/home"); // adjust later if needed
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">lvl_0</div>
        <div className="auth-sub">Sign in to continue</div>

        <form onSubmit={submit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <LoadingButton
            type="submit"
            loading={loading}
            variant="primary"
          >
            Login
          </LoadingButton>
        </form>

        <div className="auth-link">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <div className="auth-link">
          New here? <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}
