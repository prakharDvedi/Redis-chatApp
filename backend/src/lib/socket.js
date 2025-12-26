import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import redis from "./redis.js";

import User from "../models/User.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // Add to Redis SET for persistent online status
  try {
    await redis.sadd("online_users", userId);
    console.log(`${userId} added to Redis`);
  } catch (error) {
    console.error("Redis SADD failed:", error.message);
  }

  // get online user from redis
  try {
    const onlineUsers = await redis.smembers("online_users");
    io.emit("getOnlineUsers", onlineUsers);
  } catch (error) {
    console.error("Redis SMEMBERS failed, using fallback");
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.user.fullName);

    delete userSocketMap[userId];

    // Remove from Redis SET
    try {
      await redis.srem("online_users", userId);
      console.log(`${userId} removed from Redis`);
    } catch (error) {
      console.error("Redis SREM failed:", error.message);
    }

    //last seen function
    try {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      console.log(`${userId} lastSeen updated in MongoDB`);
    } catch (error) {
      console.error("MongoDB lastSeen update failed:", error.message);
    }
    // broadcast updated online users
    try {
      const onlineUsers = await redis.smembers("online_users");
      io.emit("getOnlineUsers", onlineUsers);
    } catch (error) {
      console.error("Redis SMEMBERS failed, using fallback");
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
