import React, { useState, useEffect, useRef } from "react";
import "../../css/auth.css";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/axiosConfig";

import LoadingButton from "../../ui_components/LoadingButton";

export default function OTPVerification() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const inputsRef = useRef([]);

  /* =========================
     INIT EMAIL
     ========================= */
  useEffect(() => {
    const mail =
      location.state?.email ||
      localStorage.getItem("pendingVerificationEmail");

    if (!mail) {
      navigate("/register");
      return;
    }

    setEmail(mail);
    localStorage.setItem("pendingVerificationEmail", mail);
  }, [location, navigate]);

  /* =========================
     COUNTDOWN
     ========================= */
  useEffect(() => {
    if (!countdown) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  /* =========================
     OTP INPUT HANDLING
     ========================= */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const updated = [...otp];
        updated[index] = "";
        setOtp(updated);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const updated = [...otp];
        updated[index - 1] = "";
        setOtp(updated);
      }
    }

    if (e.key === "Delete") {
      const updated = [...otp];
      updated[index] = "";
      setOtp(updated);
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasted)) return;

    setOtp(pasted.split(""));
    inputsRef.current[5]?.focus();
    e.preventDefault();
  };

  /* =========================
     VERIFY OTP (FIXED)
     ========================= */
  const verifyOTP = async (e) => {
    e.preventDefault();

    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter full OTP");
      return;
    }

    setLoading(true);
    try {
      await api.post("/otp/verify-email", { email, otp: code });
      toast.success("Email verified");
      localStorage.removeItem("pendingVerificationEmail");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESEND OTP
     ========================= */
  const resendOTP = async () => {
    setResendLoading(true);
    try {
      await api.post("/otp/resend-otp", { email });
      toast.success("OTP resent");
      setCountdown(60);
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">lvl_0</div>
        <div className="auth-sub">Verify your email</div>

        <p className="auth-sub otp-email">
          Code sent to <b>{email}</b>
        </p>

        {/* ✅ FORM FIX */}
        <form onSubmit={verifyOTP}>
          <div className="otp-group" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                maxLength={1}
                className="otp-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
              />
            ))}
          </div>

          <LoadingButton
            loading={loading}
            variant="primary"
            type="submit"
          >
            Verify
          </LoadingButton>
        </form>

        <div className="auth-link">
          <button
            type="button"
            onClick={resendOTP}
            disabled={resendLoading || countdown}
          >
            {countdown ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </div>

        <div className="auth-link">
          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
