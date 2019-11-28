const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const demoSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 400
    },
    pdfLink: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("demochallenge", demoSchema);
