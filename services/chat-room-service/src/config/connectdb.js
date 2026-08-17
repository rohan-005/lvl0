'use strict';

const mongoose = require('mongoose');

let isConnecting = false;
let retryTimer = null;

const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  isConnecting = true;
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('[chat-room-service] MONGO_URI environment variable is missing.');
    isConnecting = false;
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    family: 4,
  };

  try {
    const conn = await mongoose.connect(mongoUri, options);
    console.log(`[chat-room-service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[chat-room-service] MongoDB Connection Error: ${error.message}`);
    scheduleReconnect();
  } finally {
    isConnecting = false;
  }
};

const scheduleReconnect = () => {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    if (mongoose.connection.readyState !== 1) {
      console.log('[chat-room-service] Retrying MongoDB connection...');
      connectDB();
    }
  }, 5000);
};

// Lifecycle Event Listeners
mongoose.connection.on('error', (err) => {
  console.error('[chat-room-service] MongoDB connection error event:', err.message || err);
  if (mongoose.connection.readyState !== 1) {
    scheduleReconnect();
  }
});

mongoose.connection.on('disconnected', () => {
  console.warn('[chat-room-service] MongoDB disconnected. Attempting reconnect...');
  scheduleReconnect();
});

mongoose.connection.on('reconnected', () => {
  console.log('[chat-room-service] MongoDB reconnected successfully.');
});

module.exports = { connectDB, getDBStatus };
