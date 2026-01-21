import React, { useState, useEffect, useRef } from "react";
import "../../css/auth.css";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/axiosConfig";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const inputs = useRef([]);

  /* =========================
     INIT EMAIL
     ========================= */
  useEffect(() => {
    const mail =
      location.state?.email ||
      localStorage.getItem("pendingVerificationEmail");

    if (!mail) return navigate("/register");

    setEmail(mail);
    localStorage.setItem("pendingVerificationEmail", mail);
  }, [location, navigate]);

  /* =========================
     COUNTDOWN
     ========================= */
  useEffect(() => {
    if (!countdown) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* =========================
     INPUT HANDLERS
     ========================= */
  const handleChange = (val, i) => {
    if (!/^\d?$/.test(val)) return;

    const copy = [...otp];
    copy[i] = val;
    setOtp(copy);

    if (val && i < 5) inputs.current[i + 1].focus();
  };

  const verifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;

    setLoading(true);
    try {
      await api.post("/otp/verify-email", { email, otp: code });
      toast.success("Email verified");
      localStorage.removeItem("pendingVerificationEmail");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResendLoading(true);
    try {
      await api.post("/otp/resend-otp", { email });
      toast.success("OTP resent");
      setCountdown(60);
    } catch {
      toast.error("Could not resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  /* =========================
     AUTO VERIFY
     ========================= */
  useEffect(() => {
    if (otp.every((d) => d !== "")) verifyOTP();
  }, [otp]);

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">lvl_0</div>
        <div className="auth-sub">Verify your email</div>

        <p className="auth-sub" style={{ fontSize: "0.75rem" }}>
          Code sent to <b>{email}</b>
        </p>

        <div style={{ display: "flex", gap: "8px", margin: "24px 0" }}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={d}
              maxLength={1}
              onChange={(e) => handleChange(e.target.value, i)}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "1.2rem",
                padding: "12px",
              }}
            />
          ))}
        </div>

        <button
          className="auth-btn"
          disabled={loading}
          onClick={verifyOTP}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="auth-link">
          <button
            onClick={resendOTP}
            disabled={resendLoading || countdown}
            style={{ background: "none", border: "none", color: "#00ff77" }}
          >
            {countdown ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </div>

        <div className="auth-link">
          <button
            onClick={() => navigate("/register")}
            style={{ background: "none", border: "none", color: "#8affc1" }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
