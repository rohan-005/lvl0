const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bytecode');
    console.log(`[user-service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[user-service] DB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
