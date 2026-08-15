const axios = require("axios");

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || "http://localhost:5002";

const sendOTPEmail = async (email, otp, name, accountType) => {
  try {
    const res = await axios.post(`${EMAIL_SERVICE_URL}/api/email/send-otp`, {
      email,
      otp,
      name,
      accountType,
    }, { timeout: 4000 });
    return res.data?.success !== false;
  } catch (error) {
    console.warn("[user-service] email-service HTTP call fallback:", error.message);
    console.log(`[user-service MOCK EMAIL] OTP for ${email}: ${otp}`);
    return true; // Never crash user-service registration flow if email service is down
  }
};

const sendPasswordResetOTPEmail = async (email, otp, name) => {
  try {
    const res = await axios.post(`${EMAIL_SERVICE_URL}/api/email/send-reset-otp`, {
      email,
      otp,
      name,
    }, { timeout: 4000 });
    return res.data?.success !== false;
  } catch (error) {
    console.warn("[user-service] email-service HTTP call fallback:", error.message);
    console.log(`[user-service MOCK EMAIL] Password Reset OTP for ${email}: ${otp}`);
    return true;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
};
