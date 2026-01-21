import React, { useState } from "react";
import "../../css/auth.css";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// ✅ import LoadingButton
import LoadingButton from "../../ui_components/LoadingButton";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "gamer",
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword)
      return toast.error("Password mismatch");

    setLoading(true);

    const res = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.accountType
    );

    setLoading(false);

    if (!res.success) return toast.error(res.message);

    toast.success("Verify your email");
    navigate("/verify-email", { state: { email: formData.email } });
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">lvl_0</div>
        <div className="auth-sub">Create your identity</div>

        <form onSubmit={submit}>
          <input
            name="name"
            placeholder="Username"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          {/* ACCOUNT TYPE RADIO */}
          <div className="radio-group">
            <label
              className={`radio-card ${
                formData.accountType === "gamer" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value="gamer"
                checked={formData.accountType === "gamer"}
                onChange={handleChange}
              />
              <span>🎮 Gamer</span>
            </label>

            <label
              className={`radio-card ${
                formData.accountType === "developer" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value="developer"
                checked={formData.accountType === "developer"}
                onChange={handleChange}
              />
              <span>💻 Developer</span>
            </label>
          </div>

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />

          {/* ✅ LoadingButton instead of button */}
          <LoadingButton
            type="submit"
            loading={loading}
            variant="primary"
          >
            Register
          </LoadingButton>
        </form>

        <div className="auth-link">
          Already inside? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
