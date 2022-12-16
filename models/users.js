const mongoose = require("mongoose");

const stepSchema = mongoose.Schema({
  name : String, 
  latitude : String, 
  longitude : String, 
  mealBudget : Number, 
  roomBudget : Number
})

const tripSchema = mongoose.Schema({
  user : String , 
  destination : String, 
  steps : [stepSchema], 
  totalBudget : String, 
  startDate : Date, 
  endDate : Date
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
});


const User = mongoose.model("users", userSchema);
module.exports = {User};
