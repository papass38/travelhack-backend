const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  lastTrips: { type: mongoose.Schema.Types.ObjectId, ref: "trips" },
});

const User = mongoose.model("users", userSchema);
module.exports = User;
