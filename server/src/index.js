import { Server } from "socket.io";
import { createServer } from "http";

const server = createServer(); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("notification", (message) => {
    console.log("Received notification:", message);
  });
});

server.listen(4000, () => console.log("Socket.IO Server running on port 4000"));
