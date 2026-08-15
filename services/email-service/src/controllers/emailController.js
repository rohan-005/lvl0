const { sendEmail } = require("../utils/mailer");

exports.sendVerificationOTP = async (req, res) => {
  try {
    const { email, otp, name } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Missing email or otp" });
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to lvl_0, ${name || "User"}!</h2>
        <p>Your email verification OTP code is:</p>
        <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    const sent = await sendEmail({
      to: email,
      subject: "Verify Your Email - lvl_0",
      html,
    });

    res.json({ success: sent, message: sent ? "Verification OTP email sent" : "Failed to send email" });
  } catch (error) {
    console.error("[email-service] Verification OTP error:", error.message);
    res.status(500).json({ success: false, message: "Server error sending verification OTP" });
  }
};

exports.sendPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp, name } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Missing email or otp" });
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name || "User"}, your password reset OTP code is:</p>
        <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    const sent = await sendEmail({
      to: email,
      subject: "Password Reset Request - lvl_0",
      html,
    });

    res.json({ success: sent, message: sent ? "Password reset OTP email sent" : "Failed to send email" });
  } catch (error) {
    console.error("[email-service] Password reset OTP error:", error.message);
    res.status(500).json({ success: false, message: "Server error sending reset OTP" });
  }
};
