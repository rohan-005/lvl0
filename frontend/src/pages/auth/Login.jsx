import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import LoadingButton from "../../ui_components/LoadingButton";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (!res.success) return toast.error(res.message);
    toast.success("Access granted");
    navigate("/home");
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={submit}>
        <h1>Login</h1>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <LoadingButton loading={loading}>Login</LoadingButton>
      </form>
    </div>
  );
}
