const mongoose = require("mongoose");

const stepSchema = mongoose.Schema({
  token: String,
  name: String,
  latitude: String,
  longitude: String,
  mealBudget: Number,
  roomBudget: Number,
});

const todoSchema = mongoose.Schema({
  task: String,
});

const tripSchema = mongoose.Schema({
  token: String,
  username: String,
  user: String,
  destination: String,
  steps: [stepSchema],
  totalBudget: String,
  startDate: Date,
  endDate: Date,
});

const userSchema = mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  profile: String,
  token: String,
  lastTrips: [tripSchema],
  todo: [todoSchema],
});

const User = mongoose.model("users", userSchema);
module.exports = User;
