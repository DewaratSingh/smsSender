// src/socket.js
import { io } from "socket.io-client";

let socket = null;

export function connectToServer(serverUrl) {
  socket = io(serverUrl, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🔗 Connected to server:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from server");
  });

  socket.on("connect_error", (err) => {
    console.log("⚠️ Connection error:", err.message);
  });

  return socket;
}

export function onServer(event, callback) {
  if (!socket) return console.log("⚠️ Socket not connected");
  socket.on(event, callback);
}

export function emitToServer(event, data) {
  if (!socket) return console.log("⚠️ Socket not connected");
  socket.emit(event, data);
}
