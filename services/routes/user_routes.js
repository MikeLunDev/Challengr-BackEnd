const express = require("express");
const User = require("../../schemas/userSchema");
//const Profiles = require("../models/profiles");
const passport = require("passport");
const { getToken } = require("../../authentication/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (email === undefined || password === undefined) {
    res.statusCode = 400;
    res.json({
      status: "email or password missing",
      success: false
    });
  } else {
    try {
      var newUser = new User({
        email: email,
        password: password
      });
      newUser = await User.register(newUser, password);
      res.status(201).json({
        status: "New user created",
        success: true,
        user: newUser
      });
    } catch (err) {
      res.status(400).send({
        message: "A user with the given email is already registered",
        success: false
      });
    }
  }
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  var token = getToken({
    _id: req.user._id
  });
  res.send({ token, success: true });
});

router.post("/refreshToken", passport.authenticate("jwt"), (req, res) => {
  var token = getToken({
    _id: req.user._id
  });
  res.status(200).send({
    success: true,
    token
  });
});

//for dev purpose only
router.delete("/remove", async (req, res) => {
  toRemove = await User.findOneAndRemove({ email: req.body.email });
});

//for dev purpose only
router.get("/", async (req, res) => {
  res.send(await User.find({}));
});

module.exports = router;
