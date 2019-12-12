const express = require("express");
const User = require("../../schemas/userSchema");
const userProfile = require("../../schemas/userProfileSchema");
const passport = require("passport");
const { getToken } = require("../../authentication/auth");
require("dotenv").config();

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  delete req.body.password;
  if (email === undefined || password === undefined) {
    res.statusCode = 400;
    res.json({
      status: "Missing fields, couldn't procede.",
      error: "Email or password missing",
      success: false
    });
  } else {
    try {
      var newUser = new User({
        email: email,
        password: password
      });
      newUser = await User.register(newUser, password);
      req.body.admin =
        email === process.env.admin1 ||
        email === process.env.admin2 ||
        email === process.env.admin3
          ? true
          : false;
      var newProfile = await userProfile.create(req.body);
      res.status(201).json({
        status: "New user and profile created",
        error: "",
        success: true,
        user: newUser,
        profile: newProfile
      });
    } catch (err) {
      res.status(500).send({
        status: "Something went wrong",
        error: err.message,
        success: false
      });
    }
  }
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  var token = getToken({
    _id: req.user._id
  });
  res.send({ token, success: true, status: "Logged in successfully" });
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
