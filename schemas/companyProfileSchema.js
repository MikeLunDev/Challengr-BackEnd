const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companyProfile = new Schema(
  {
    companyName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    companySize: {
      type: Number,
      required: true
    },
    company: {
      type: Boolean,
      default: true
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
    website: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("companyProfile", companyProfile);
