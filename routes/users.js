var express = require("express");
var router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");

router.get("/all", (req, res) => {
  User.find({}).then((data) => {
    res.json(data);
  });
});

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
        photo: req.body.photo,
        password: hash,
        token: uid2(32),
        lastTrips: [],
        favorites: [],
      });

      newUser.save().then((newDoc) => {
        res.json({ result: true, user: newDoc });
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
    console.log(req.body);
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, user: data });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

// post a new trip in db from the FinalTravelScreen

router.post("/newtrip", (req, res) => {
  if (
    !checkBody(req.body, [
      "username",
      "token",
      "destination",
      "startDate",
      "endDate",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  } else {
    User.findOneAndUpdate(
      { username: req.body.username, token: req.body.token },
      {
        // because the trips are in an array of subdoc in the documents  user, we have to use $push to add the trip in that array.
        $push: {
          lastTrips: {
            user: req.body.username,
            destination: req.body.destination,
            steps: req.body.steps,
            totalBudget: req.body.budget,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          },
        },
      }
    ).then((data) => res.json({ result: true, newTrip: data }));
  }
});

// Get the las trip added by a specific user
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

// Get all the trips of the specific user
router.get("/alltrips/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then((data) => {
    if (!data) {
      res.json({ result: false, error: "user not found" });
    } else {
      res.json({ result: true, trips: data.lastTrips });
    }
  });
});

router.get("/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then((data) => {
    if (data) {
      res.json({ result: true, user: data });
    } else {
      res.json({ result: false, error: "error" });
    }
  });
});

router.put("/info/:token", (req, res) => {
  User.findOneAndUpdate(
    { token: req.params.token },
    //The $set operator is a MongoDB operator that is used to update specific fields in a document. It replaces the value of a field with the specified value.
    { $set: { username: req.body.replaceUsername } },
    //The new: true option is used in MongoDB to specify that the updated document should be returned in the response.
    { new: true }
  ).then((updatedUser) => {
    if (!updatedUser) {
      res.json({ error: "User not found" });
    } else {
      res.json({ result: true, user: updatedUser });
    }
  });
});

router.put("/photo/:token", async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  console.log("req.file", req.files.userPhoto);
  const resultMove = await req.files.userPhoto.mv(photoPath);
  console.log("resultMove", resultMove);
  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    User.findOneAndUpdate(
      { token: req.params.token },
      //The $set operator is a MongoDB operator that is used to update specific fields in a document. It replaces the value of a field with the specified value.
      { $set: { photo: resultCloudinary.secure_url } },
      //The new: true option is used in MongoDB to specify that the updated document should be returned in the response.
      { new: true }
    ).then((updatedUser) => {
      if (!updatedUser) {
        res.json({ error: "User not found" });
      } else {
        res.json({ result: true, user: updatedUser });
      }
    });
    fs.unlinkSync(photoPath);
  }
});

router.put("/email/:email", (req, res) => {
  const newEmail = req.body.replaceEmail;
  User.findOneAndUpdate(
    { email: req.params.email },
    //The $set operator is a MongoDB operator that is used to update specific fields in a document. It replaces the value of a field with the specified value.
    { $set: { email: newEmail } },

    //The new: true option is used in MongoDB to specify that the updated document should be returned in the response.
    { new: true }
  ).then((updatedUser) => {
    if (!updatedUser) {
      res.json({ error: "User not found" });
    } else {
      res.json({ result: true, user: updatedUser });
    }
  });
});

// remove a trip based on his username and the id of the trip
router.delete("/removeTrip/:token", (req, res) => {
  User.updateOne(
    { token: req.params.token },
    { $pull: { lastTrips: { _id: req.body.id } } }
  ).then((data) => {
    res.json({ result: true, data });
  });
});

router.get("/todo/:token/:todoId", (req, res) => {
  User.findOne(
    {
      token: req.params.token,
      "lastTrips._id": req.params.todoId,
    },
    { "lastTrips.$": 1 }
  ).then((data) => {
    res.json({
      result: true,
      todo: data.lastTrips[0].todo,
    });
  });
});

router.post("/newTodo/:token/:todoId", (req, res) => {
  User.findOneAndUpdate(
    { token: req.params.token, "lastTrips._id": req.params.todoId },
    {
      $push: {
        "lastTrips.$.todo": { task: req.body.newTodo },
      },
    },
    { returnOriginal: false }
  ).then((data) => {
    const todoData = data.lastTrips.find(
      (e) => e._id == req.params.todoId
    ).todo;
    res.json({
      result: true,
      todoData: todoData,
    });
  });
});

router.delete("/removeTodo/:token/:todoId", (req, res) => {
  User.findOneAndUpdate(
    { token: req.params.token, "lastTrips._id": req.params.todoId },
    {
      $pull: {
        "lastTrips.$.todo": { task: req.body.newTodo },
      },
    },
    { returnOriginal: false }
  ).then((data) => {
    const todoData = data.lastTrips.find(
      (e) => e._id == req.params.todoId
    ).todo;
    res.json({
      result: true,
      todoData: todoData,
    });
  });
});

router.post("/addFavorite/:token", (req, res) => {
  User.updateOne(
    { token: req.params.token },
    { $push: { favorites: { name: req.body.name } } }
  ).then((data) => {
    res.json({ result: true, data });
  });
});

router.delete("/removeFavorite/:token", (req, res) => {
  User.updateOne(
    { token: req.params.token },
    { $pull: { favorites: { name: req.body.name } } }
  ).then((data) => {
    res.json({ result: true, data });
  });
});
module.exports = router;
