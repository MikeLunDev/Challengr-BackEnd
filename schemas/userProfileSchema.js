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
    min: 0,
    required: true
  },
  demoChallengeLink: {
    type: String
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
      type: String,
      required: true,
      unique: true
    },
    company: {
      type: Boolean,
      default: false
    },
    githubProfile: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    surname: {
      type: String,
      required: true
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
    },
    privacySettings: {
      showChallengeCompleted: {
        type: Boolean,
        default: true,
        required: true
      },
      showChallengeUploaded: {
        type: Boolean,
        default: true,
        required: true
      },
      showGithubLink: {
        type: Boolean,
        default: true,
        required: true
      },
      showBio: {
        type: Boolean,
        default: true,
        required: true
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("userProfile", userProfile);
