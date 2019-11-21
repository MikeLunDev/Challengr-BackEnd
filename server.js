const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./services/routes/user_routes");
const passport = require("passport");

const app = express();
app.use(express.json());
app.use(passport.initialize());
app.set("port", process.env.PORT || 3015);
app.use("/user", cors(), userRouter);
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
