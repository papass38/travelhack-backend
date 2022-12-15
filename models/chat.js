const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  name: String,
  channel: String,
  message: String,
  date: Date,
});

const Chat = mongoose.model("chats", chatSchema);
module.exports = Chat;
