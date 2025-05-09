// server.js
const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Notify others in the room
    socket.to(roomId).emit("user-joined", {
      userId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave a room
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);

    // Notify others in the room
    socket.to(roomId).emit("user-left", {
      userId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Chat message
  socket.on("send-message", (data) => {
    const { roomId, message } = data;
    console.log(`Message in room ${roomId}: ${message.content}`);

    // Broadcast to everyone in the room except sender
    socket.to(roomId).emit("receive-message", message);
  });

  // Music control events
  socket.on("play-track", (data) => {
    const { roomId, track } = data;
    socket.to(roomId).emit("track-changed", track);
  });

  socket.on("pause-track", (roomId) => {
    socket.to(roomId).emit("track-paused");
  });

  socket.on("resume-track", (roomId) => {
    socket.to(roomId).emit("track-resumed");
  });

  socket.on("seek-track", (data) => {
    const { roomId, time } = data;
    socket.to(roomId).emit("track-seeked", time);
  });

  socket.on("add-to-queue", (data) => {
    const { roomId, track } = data;
    socket.to(roomId).emit("queue-updated", { action: "add", track });
  });

  socket.on("remove-from-queue", (data) => {
    const { roomId, trackId } = data;
    socket.to(roomId).emit("queue-updated", { action: "remove", trackId });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});