const Message = require("../models/Message");
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const socketSetup = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New client connected: ", socket.id);

    socket.on("joinRoom", ({ senderId }) => {
      addUser(senderId, socket.id);
    });

    socket.on("send_message", async (msg) => {
      console.log("📨 Message received:", msg);

      try {
        const newMessage = new Message({
          sender: msg.sender,
          receiver: msg.receiver,
          text: msg.text,
        });

        await newMessage.save();

        const user = getUser(msg.receiver);
        if (user) {
          io.to(user.socketId).emit("receiveMessage", newMessage);
        }
      } catch (err) {
        console.error("❌ Message save error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected: ", socket.id);
      removeUser(socket.id);
    });
  });
};

module.exports = socketSetup;
