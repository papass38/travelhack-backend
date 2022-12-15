var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const Trip = require("../models/trips");
const User = require("../models/users");

const { checkBody } = require("../modules/checkBody");

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
          user: req.body.user,
          destination: req.body.destination,
          steps: req.body.steps,
          totalBudget: req.body.budget,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
        })
        
        newTrip.save().then((data) => {
        User.findOneAndUpdate(
            {$push : {lastTrips : data._id}}
        ).then((data) =>res.json({result : true}))
      })
    }});
  }
});

router.get("/allTrips/:username", (req, res) => {
    User.findOne({username : req.params.username}).populate("lastTrips").then(data => res.json({result : true, data : data} ))
})

module.exports = router;
