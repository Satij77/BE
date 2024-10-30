const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://DangNH:DangNH@dangnh.tng5t.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

// Hàm xóa tài khoản chưa xác thực
const deleteUnverifiedAccounts = async () => {
  const expirationTime = 1 * 60 * 1000; // 1 phút
  const thresholdDate = new Date(Date.now() - expirationTime);
  
  console.log(`Đang xóa tài khoản chưa xác thực trước: ${thresholdDate}`);
  
  const result = await User.deleteMany({ 
    isVerified: false, 
    createdAt: { $lt: thresholdDate } 
  });
  
  console.log(`Số tài khoản đã xóa: ${result.deletedCount}`);
};

// Gọi hàm deleteUnverifiedAccounts mỗi phút
setInterval(() => {
  deleteUnverifiedAccounts();
}, 60 * 1000); // Gọi hàm mỗi 60 giây

// Routes
app.get("/", (req, res) => res.send("Backend is running"));

// Import routes
const userRoutes = require("./routes/userRoutes");


app.use(express.json());

// Use routes
app.use("/users", userRoutes);


// Socket.io for chat
io.on("connection", (socket) => {
  console.log("User connected to chat");
  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Payment
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
