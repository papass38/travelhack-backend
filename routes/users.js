var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { findOneAndUpdate } = require("../models/users");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        lastTrips: [],
      });

      newUser.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User already exists" });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

router.post("/newtrip", (req, res) => {
  if (
    !checkBody(req.body, ["username", "destination", "startDate", "endDate"])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  } else {
    User.findOneAndUpdate(
      { username: req.body.username },
      {
        $push: {
          lastTrips: {
            user: req.body.username,
            destination: req.body.destination,
            steps: [],
            totalBudget: req.body.budget,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          },
        },
      }
    ).then((data) => res.json({ result: true, newTrip: data }));
  }
});

router.post("/newtrip/newstep", async (req, res) => {
  const userFound = await User.findOne({ username: req.body.username });
  console.log(userFound);
  const tripsArray = userFound.lastTrips;

  const lastTripInArray = tripsArray[tripsArray.length - 1];

  lastTripInArray.steps.push({
    name: req.body.name,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    mealBudget: req.body.mealBudget,
    roomBudget: req.body.roomBudget,
  });

  userFound.save();

  res.json({ result: true, steps: lastTripInArray });
});

router.get("/newtrip/:username", (req, res) => {
  User.findOne({ username: req.params.username }).then((data) => {
    if (!data) {
      res.json({ result: false, error: "user not found" });
    } else {
      res.json({
        result: true,
        newTrip: data.lastTrips[data.lastTrips.length - 1],
      });
    }
  });
});

router.get("/alltrips/:username", (req, res) => {
  User.findOne({ username: req.params.username }).then((data) => {
    if (!data) {
      res.json({ result: false, error: "user not found" });
    } else {
      res.json({ result: true, trips: data.lastTrips });
    }
  });
});

router.put("/:username", (req, res) => {
  const newUsername = req.body.replaceUsername;
  User.findOneAndUpdate(
    { username: req.params.username },
    //The $set operator is a MongoDB operator that is used to update specific fields in a document. It replaces the value of a field with the specified value.
    { $set: { username: newUsername } },

    //The new: true option is used in MongoDB to specify that the updated document should be returned in the response.
    { new: true }
  ).then((updatedUser) => {
    if (!updatedUser) {
      res.json({ error: "User not found" });
    } else {
      res.json({ result: true, data: updatedUser });
    }
  });
});

module.exports = router;
