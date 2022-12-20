var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const Pusher = require("pusher");
const Chat = require("../models/chat");

const pusherConfig = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
};
const pusher = new Pusher(pusherConfig);

const MY_APY_KEY_LOC = process.env.MY_APY_KEY_LOC;

// GET MY REGION
router.post("/location", (req, res) => {
  fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.body.latitude},${req.body.longitude}&key=${MY_APY_KEY_LOC}`
  )
    .then((res) => res.json())
    .then((data) => {
      const regionName = data.results[0].address_components.find((e) =>
        e.types.some((e) => e === "administrative_area_level_1")
      ).long_name;
      res.json({
        result: true,
        location: regionName,
      });
    });
});

//GET ALL CHAT FROM A CHANNEL
router.get("/channel/:location", (req, res) => {
  console.log(req.params.location);
  Chat.find({ channel: req.params.location }).then((data) => {
    if (data) {
      res.json({ result: true, message: data });
    } else {
      res.json({ result: false });
    }
  });
});

// SEND A CHAT WITH PUSHER
router.post("/newChat", (req, res) => {
  pusher
    .trigger(req.body.channel, "message", {
      name: req.body.name,
      channel: req.body.channel,
      message: req.body.message,
    })
    .then(() =>
      Chat.create({
        name: req.body.name,
        channel: req.body.channel,
        message: req.body.message,
        date: req.body.date,
      }).then(() => res.json({ result: true, message: "send" }))
    );
});

module.exports = router;
