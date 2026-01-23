/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axiosConfig";

const AuthContext = createContext(null);

/* =========================
   HOOK
   ========================= */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

/* =========================
   PROVIDER
   ========================= */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     RESTORE SESSION
     ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  /* =========================
     CENTRAL USER SYNC (CRITICAL)
     ========================= */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  /* =========================
     LOGIN
     ========================= */
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accountType", user.accountType);

      setUser(user);

      return { success: true, user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  /* =========================
     REGISTER
     ========================= */
  const register = async (name, email, password, accountType) => {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        accountType,
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  /* =========================
     PASSWORD RESET
     ========================= */
  const forgotPassword = async (email) => {
    try {
      await api.post("/otp/forgot-password", { email });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "OTP send failed",
      };
    }
  };

  const verifyPasswordResetOTP = async (email, otp) => {
    try {
      const res = await api.post("/otp/verify-password-reset", { email, otp });
      return {
        success: true,
        resetToken: res.data.resetToken,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "OTP invalid",
      };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      await api.put("/otp/reset-password", { resetToken, password });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Reset failed",
      };
    }
  };

  const resendPasswordResetOTP = async (email) => {
    try {
      await api.post("/otp/resend-password-reset", { email });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Resend failed",
      };
    }
  };

  /* =========================
     LOGOUT
     ========================= */
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  /* =========================
     CONTEXT VALUE
     ========================= */
  const value = {
    user,
    loading,

    // auth
    login,
    register,
    logout,

    // password
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword,
    resendPasswordResetOTP,

    // identity (IMPORTANT)
    updateUser,

    // utils
    getAccountType: () => localStorage.getItem("accountType"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
