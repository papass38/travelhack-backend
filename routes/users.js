var express = require("express");
var router = express.Router();

require("../models/connection");
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

router.get("/:username", (req, res) => {
  User.findOne({ username: req.params.username }).then((data) => {
    res.json({ result: true, user: data });
  });
});

// router.post("/newtrip/newstep", (req, res) => {
//   if (
//     !checkBody(req.body, ["username", "destination", "startDate", "endDate"])
//   ) {
//     res.json({ result: false, error: "Missing or empty fields" });
//     return;
//   } else {
//     findOneAndUpdate(
//       { username: req.body.username },
//       {
//         $push :{
//           lastTrips[lastTrips.length - 1].steps{
//             name: String,
//             latitude: String,
//             longitude: String,
//             mealBudget: Number,
//             roomBudget: Number,
//           },
//         }
//       }
//     );
//   }
// });

module.exports = router;
