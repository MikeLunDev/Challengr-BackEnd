const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const completedChallengeSchema = new Schema({
  challengeId: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  }
});

const inProgressChallengeSchema = new Schema({
  challengeId: {
    type: String,
    required: true
  },
  lastSubmitAt: {
    type: Date,
    required: true
  },
  quizScore: {
    type: Number,
    min: 0
  }
});

const uploadedChallengeSchema = new Schema({
  challengeId: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  }
});

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
      type: [completedChallengeSchema]
    },
    inProgressChallenge: {
      type: [inProgressChallengeSchema]
    },
    uploadedChallenge: {
      type: [uploadedChallengeSchema]
    },
    bio: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("userProfile", userProfile);
