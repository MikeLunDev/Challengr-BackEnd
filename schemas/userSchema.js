const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const User = new Schema({});

const options = {
  usernameField: "email",
  passwordField: "password"
};
User.plugin(passportLocalMongoose, options);
module.exports = mongoose.model("user", User);
