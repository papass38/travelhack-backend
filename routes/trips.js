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
          user: data._id,
          destination: req.body.destination,
          steps: [req.body.steps],
          totalBudget: req.body.budget,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
        });
        newTrip.save().then((data) => res.json({ result: true }));
      }
    });
  }
});

module.exports = router;
