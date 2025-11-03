const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//for posts
app.use("/api/posts", require("./routes/postRoutes"));


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Static folder for uploaded files
app.use("/uploads", express.static("uploads"));



///////////////////////////////
// Admin upload events
const eventRoutes = require("./routes/eventRoutes");
app.use("/api/events", eventRoutes);







// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store connected users: userId => socketId
const users = {};

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Attach io and users to app.locals (recommended way to share)
app.locals.io = io;
app.locals.users = users;

// Routes
app.use("/api", require("./routes/auth"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/user", require("./routes/user")); // this will use io and users

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
