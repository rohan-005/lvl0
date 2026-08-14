const jwt = require("jsonwebtoken");

const generateToken = (id, expiresIn) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRE || "10d",
  });
};

module.exports = generateToken;
