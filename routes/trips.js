var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const {Trip, Step} = require("../models/trips");
const User = require("../models/users");
// const Step = require("../models/trips");

const { checkBody } = require("../modules/checkBody");

// route post to create user

// route post to add trip to user
// pour ça -> findOne (if async /await) user & push inside trips key OU updateOne avec .then()

router.post("/newtrip", (req, res) => {
  if (
    !checkBody(req.body, ["username", "destination", "startDate", "endDate"])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  } else {
    User.findOne({ username: req.body.username }).then((data) => {
      if (data) {
        console.log(data._id);
        const newTrip = new Trip({
          user: req.body.username,
          destination: req.body.destination,
          steps: [],
          totalBudget: req.body.budget,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
        })
        
        newTrip.save().then((data) => {
        User.findOneAndUpdate(
            {username : req.body.username},
            {$push : {lastTrips : data._id}}
        ).then((data) => res.json({result : true, id : data.lastTrips[data.lastTrips.length -1]}))
      })
    }});
  }
});

router.post("/newTrip/:id", (req, res) => {
    const newStep = new Step({
        name : req.body.name, 
        latitude : req.body.latitude, 
        longitude : req.body.longitude, 
        mealBudget : req.body.mealBudget, 
        roomBudget : req.body.roomBudget
    })
    console.log(newStep)
    newStep.save().then(data => {   
        Trip.findByIdAndUpdate(req.params.id,
            {$push : {steps : newStep}}
        ).then(res.json({result : true, data : data}))
    })
})

router.get("/allTrips/:username", (req, res) => {
    User.findOne({username : req.params.username}).populate("lastTrips").then(data => res.json({result : true, data : data} ))
})

router.get("/allSteps/:id", (req, res) => {
    Trip.find(req.params.id).then(data => res.json({data : data}))
})

module.exports = router;
