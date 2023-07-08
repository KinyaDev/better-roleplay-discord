const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();

let api_endpoint = "https://discord.com/api/v10";

app.set("port", process.env.PORT);
app.use(cookieParser());
app.use(express.static(__dirname + "/dashbord"));
app.get("/", (req, res) => {
  let token = req.cookies.token;
  if (token) {
    console.log("Someone is in the dashbord", token);
  }

  res.sendFile(__dirname + "/dashbord/index.html");
});

// Make online the dashbord

let server = app.listen(app.get("port"), () =>
  console.log("Web server listening on port:" + app.get("port"))
);

module.exports = { app, server };
