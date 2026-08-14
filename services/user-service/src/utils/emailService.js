const nodemailer = require("nodemailer");

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[user-service] Email credentials missing in env, email sending mocked");
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOTPEmail = async (email, otp, name, accountType) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[user-service MOCK EMAIL] OTP for ${email}: ${otp}`);
    return true;
  }

  const mailOptions = {
    from: `"lvl_0 App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - lvl_0",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to lvl_0, ${name || "User"}!</h2>
        <p>Your email verification OTP code is:</p>
        <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("[user-service] Send OTP email error:", error.message);
    return false;
  }
};

const sendPasswordResetOTPEmail = async (email, otp, name) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[user-service MOCK EMAIL] Password Reset OTP for ${email}: ${otp}`);
    return true;
  }

  const mailOptions = {
    from: `"lvl_0 App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request - lvl_0",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name || "User"}, your password reset OTP code is:</p>
        <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("[user-service] Send Password Reset OTP email error:", error.message);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
};
