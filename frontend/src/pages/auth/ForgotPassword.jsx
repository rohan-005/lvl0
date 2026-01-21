import React, { useState, useRef } from "react";
import "../../css/auth.css";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

import LoadingButton from "../../ui_components/LoadingButton";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const {
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword,
  } = useAuth();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputsRef = useRef([]);

  /* =========================
     STEP 1: SEND OTP
     ========================= */
  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await forgotPassword(email);
    setLoading(false);

    if (!res.success) return toast.error(res.message);

    toast.success("OTP sent");
    setStep(2);
    inputsRef.current[0]?.focus();
  };

  /* =========================
     OTP HANDLING
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
     STEP 2: VERIFY OTP (FIXED)
     ========================= */
  const verifyOTP = async (e) => {
    e.preventDefault();

    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter full OTP");

    setLoading(true);
    const res = await verifyPasswordResetOTP(email, code);
    setLoading(false);

    if (!res.success) return toast.error(res.message);

    toast.success("OTP verified");
    setResetToken(res.resetToken);
    setStep(3);
  };

  /* =========================
     STEP 3: RESET PASSWORD
     ========================= */
  const submitPassword = async (e) => {
    e.preventDefault();

    if (password.length < 6)
      return toast.error("Password too short");

    setLoading(true);
    const res = await resetPassword(resetToken, password);
    setLoading(false);

    if (!res.success) return toast.error(res.message);

    toast.success("Password updated");
    setStep(1);
    setEmail("");
    setPassword("");
    setOtp(Array(6).fill(""));
    navigate("/login")
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">lvl_0</div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="auth-sub">Recover access</div>

            <form onSubmit={sendOTP}>
              <input
                type="email"
                placeholder="Registered Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <LoadingButton loading={loading} variant="primary" type="submit">
                Send OTP
              </LoadingButton>
            </form>
          </>
        )}

        {/* STEP 2 (FIXED) */}
        {step === 2 && (
          <>
            <div className="auth-sub">Enter verification code</div>

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
                Verify OTP
              </LoadingButton>
            </form>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="auth-sub">Set new password</div>

            <form onSubmit={submitPassword}>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <LoadingButton loading={loading} variant="primary" type="submit">
                Update Password
              </LoadingButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
