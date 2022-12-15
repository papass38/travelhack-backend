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

const Trip = mongoose.model("trips", tripSchema);
module.exports = Trip;