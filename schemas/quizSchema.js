const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  question: {
    text: { type: String, required: true, minlength: 50, maxlength: 400 },
    image: { type: String }
  },
  answers: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
});

const quizSchema = new Schema(
  {
    time: {
      type: Number,
      min: 300,
      max: 172800,
      required: true
    },
    questions: {
      type: [questionSchema],
      validate: [
        value => value.length >= 5,
        "Quiz must have at least 5 questions"
      ]
    },
    author: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("quiz", quizSchema);
