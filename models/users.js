const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  profile: String,
  token: String,
  lastTrips: { type: mongoose.Schema.Types.ObjectId, ref: "trips" },
});

const User = mongoose.model("users", userSchema);
module.exports = User;
