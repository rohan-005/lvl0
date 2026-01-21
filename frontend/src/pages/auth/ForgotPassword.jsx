import React, { useState } from "react";
import "../../css/auth.css";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await forgotPassword(email);
    setLoading(false);

    if (!res.success) return toast.error(res.message);
    toast.success("OTP sent");
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">lvl_0</div>
        <div className="auth-sub">Recover access</div>

        <form onSubmit={submit}>
          <input
            placeholder="Registered Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="auth-btn">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
