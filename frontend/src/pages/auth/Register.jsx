import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import LoadingButton from "../../ui_components/LoadingButton";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return toast.error("Password mismatch");

    setLoading(true);
    const res = await register(
      formData.name,
      formData.email,
      formData.password,
      "gamer"
    );
    setLoading(false);

    if (!res.success) return toast.error(res.message);
    toast.success("Verify your email");
    navigate("/verify-email", { state: { email: formData.email } });
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={submit}>
        <h1>Register</h1>

        <input placeholder="Username" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <input type="email" placeholder="Email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        <input type="password" placeholder="Password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        <input type="password" placeholder="Confirm Password" onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />

        <LoadingButton loading={loading}>Register</LoadingButton>
      </form>
    </div>
  );
}
