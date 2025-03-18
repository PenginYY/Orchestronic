import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for notifications from the backend (Airflow)
  socket.on("notification", (data) => {
    console.log("Received notification:", data);
    // Broadcast to all connected clients
    io.emit("notification", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(4000, () => {
  console.log("Socket.IO server running on port 4000");
});
