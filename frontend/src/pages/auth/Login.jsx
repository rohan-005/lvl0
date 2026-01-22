import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import LoadingButton from "../../ui_components/LoadingButton";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setData({ ...data, password: e.target.value })}
        required
      />

      <div className="auth-link">
        <Link to="/forgot-password">Forgot password?</Link>
      </div>

      <LoadingButton type="submit" loading={loading}>Login</LoadingButton>
    </form>
  );
}
