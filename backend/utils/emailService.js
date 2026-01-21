const nodemailer = require("nodemailer");

/* =========================
   TRANSPORT
   ========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS?.trim(),
  },
});

/* =========================
   BASE TEMPLATE
   ========================= */
const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#050505;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">

  <div style="
    max-width:600px;
    margin:30px auto;
    background:#0a0a0a;
    border:1px solid #00ff77;
    border-radius:16px;
    padding:28px;
  ">

    <h1 style="
      font-family:Orbitron,Arial,sans-serif;
      color:#00ff77;
      text-align:center;
      margin:0;
      font-size:32px;
      letter-spacing:2px;
    ">
      lvl_0
    </h1>

    <p style="
      text-align:center;
      color:#8affc1;
      margin:8px 0 24px;
      font-size:14px;
    ">
      ${title}
    </p>

    ${content}

    <p style="
      margin-top:32px;
      font-size:12px;
      color:#777;
      text-align:center;
    ">
      © ${new Date().getFullYear()} lvl_0 · Play. Build. Compete.
    </p>

  </div>
</body>
</html>
`;

/* =========================
   SEND MAIL HELPER
   ========================= */
const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"lvl_0" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
};

/* =========================
   EMAIL VERIFICATION OTP
   ========================= */
const sendOTPEmail = async (email, otp, name = "", accountType = "gamer") => {
  const html = baseTemplate(
    "Verify your identity",
    `
    <p>Hey <b>${name || "player"}</b>,</p>

    <p>
      Welcome to <b>lvl_0</b> as a 
      <b style="color:#00ff77">${accountType}</b>.
    </p>

    <p>Use the code below to verify your email:</p>

    <div style="text-align:center;margin:28px 0;">
      <div style="
        display:inline-block;
        padding:18px 30px;
        font-size:32px;
        letter-spacing:6px;
        background:#00ff77;
        color:#000;
        border-radius:12px;
        font-weight:bold;
      ">
        ${otp}
      </div>
    </div>

    <p>This code expires in <b>10 minutes</b>.</p>
    <p>If this wasn’t you, ignore this email.</p>
    `
  );

  return sendMail(email, "lvl_0 · Verification Code", html);
};

/* =========================
   PASSWORD RESET OTP
   ========================= */
const sendPasswordResetOTPEmail = async (email, otp, name = "") => {
  const html = baseTemplate(
    "Reset access",
    `
    <p>${name || "Player"},</p>

    <p>Use the code below to reset your <b>lvl_0</b> password:</p>

    <div style="text-align:center;margin:28px 0;">
      <div style="
        display:inline-block;
        padding:18px 30px;
        font-size:32px;
        letter-spacing:6px;
        background:#00ff77;
        color:#000;
        border-radius:12px;
        font-weight:bold;
      ">
        ${otp}
      </div>
    </div>

    <p>This code expires in <b>10 minutes</b>.</p>
    <p>If you didn’t request this, secure your account.</p>
    `
  );

  return sendMail(email, "lvl_0 · Reset Code", html);
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
};
