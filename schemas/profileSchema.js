const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Profile = new Schema({
  username: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  surname: {
    type: String
  },
  prefLanguage: {
    type: String
  },
  proAccount: {
    type: Boolean,
    default: false
  },
  admin: {
    type: Boolean,
    default: false
  },
  completedChallenge: {
    type: Array
  },
  uploadedChallenge: {
    type: Array
  }
});

module.exports = mongoose.model("profile", Profile);
