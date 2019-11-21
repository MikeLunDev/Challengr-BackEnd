const express = require("express");
const cors = require("cors");

const app = express();
app.set("port", process.env.PORT || 3015);

app.listen(app.get("port"), () => {
  console.log("running on " + app.get("port"));
});
