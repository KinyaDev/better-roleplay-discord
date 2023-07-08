const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();

let api_endpoint = "https://discord.com/api/v10";

app.set("port", process.env.PORT);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + "/dashbord"));
app.get("/", (req, res) => {
  let token = req.cookies.token;
  if (token) {
    console.log("Someone is in the dashbord", token);
  }

  res.sendFile(__dirname + "/dashbord/index.html");
});

app.get("/terms", (req, res) => {
  res.sendFile(__dirname + "/dashbord/term-of-service.html");
});

app.get("/privacy", (req, res) => {
  res.sendFile(__dirname + "/dashbord/privacy-policy.html");
});

app.post("/api/log/:msg", (req, res) => {
  console.log(req.params.msg);
});

// Make online the dashbord

let server = app.listen(app.get("port"), () =>
  console.log("Web server listening on port:" + app.get("port"))
);

module.exports = { app, server };
