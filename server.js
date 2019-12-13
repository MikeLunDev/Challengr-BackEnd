const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./services/routes/user_routes");
const challengrRouter = require("./services/routes/challengr_routes");
const quizRouter = require("./services/routes/quiz_routes");
const passport = require("passport");
const profileRouter = require("./services/routes/profile_routes");
const demoChallengeRouter = require("./services/routes/demo_routes");
const { join } = require("path");

const app = express();
app.use(express.json());
app.use(passport.initialize());
app.use(
  "/question_images/",
  express.static(join(__dirname, "./public/question_images"))
);
app.use("/demo_pdf/", express.static(join(__dirname, "./public/demo_pdf")));
app.set("port", process.env.PORT || 3015);
app.use("/user", cors(), userRouter);
app.use("/profile", cors(), profileRouter);
app.use("/challenge", cors(), challengrRouter);
app.use("/demoChallenge", cors(), demoChallengeRouter);
app.use("/quiz", cors(), quizRouter);
let connectDbUri;

switch (process.env.NODE_ENV) {
  case "test":
    connectDbUri = "mongodb://localhost:27017/testdb";
    break;
  case "development":
    connectDbUri = "mongodb://localhost:27017/developdb";
    break;
  case "production":
    connectDbUri = "cloud atlas link";
    break;
  default:
    connectDbUri = "mongodb://localhost:27017/developdb";
    break;
}

mongoose
  .connect(connectDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(conn => {
    console.log("connected with", connectDbUri);
  })
  .catch(error => {
    console.log(error);
  });

app.listen(app.get("port"), () => {
  console.log("running on " + app.get("port"));
});

module.exports = { app };
