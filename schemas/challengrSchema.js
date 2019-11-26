const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentSchema = new Schema({
  resourceType: {
    type: String,
    enum: ["quizId", "demoId", "codingChallengeId"],
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

const challengrSchema = new Schema(
  {
    author: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    languages: {
      type: [String],
      enum: ["Javascript", "NodeJs", "C#"],
      required: true
    },
    time: {
      type: Number,
      required: true
    },
    content: {
      type: [contentSchema],
      required: true,
      validate: [
        value => value.length > 0,
        "Challenge must have at least 1 block"
      ]
    },
    upvotes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("challengr", challengrSchema);
