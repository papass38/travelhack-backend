const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  channel: String,
  message: String,
  date: Date,
});

const Chat = mongoose.model("chats", chatSchema);
module.exports = Chat;
