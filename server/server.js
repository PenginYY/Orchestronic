import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const PORT = 4000;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware to parse JSON (if needed)
app.use(express.json());

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("notification", (data) => {
    try {
      console.log("Received notification:", data);
      io.emit("notification", data); // Broadcast to all connected clients
    } catch (error) {
      console.error("Error broadcasting notification:", error);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`Socket error: ${error}`);
  });
});

// Health check endpoint
app.get("/", (req, res) => {
  try {
    const clientCount = io.engine.clientsCount;
    res.status(200).json({
      status: "success",
      message: "Socket server is running",
      connectedClients: clientCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
});

// Start server with error handling
server
  .listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
  })
  .on("error", (error) => {
    console.error(`Server failed to start: ${error.message}`);
  });
