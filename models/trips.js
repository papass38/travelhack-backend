const mongoose = require("mongoose");

const tripSchema = mongoose.Schema({
  username : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
  destination : String, 
  budget : String, 
  steps : [stepSchema], 
  totalBudget : String, 
  startDate : Date, 
  endDate : Date
});

const Trip = mongoose.model("trips", tripSchema);
module.exports = Trip;