const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userProfile = new Schema(
  {
    username: {
      type: String
    },
    company: {
      type: Boolean,
      default: true
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
    },
    bio: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("userProfile", userProfile);
