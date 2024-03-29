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
  todo: [todoSchema],
});

const favoriteSchema = mongoose.Schema({
  name: String,
});

const userSchema = mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  photo: String,
  token: String,
  lastTrips: [tripSchema],
  favorites: [favoriteSchema],
});

const User = mongoose.model("users", userSchema);
module.exports = User;
