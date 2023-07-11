const express = require("express");
const cookieParser = require("cookie-parser");
const { Client } = require("discord.js");
const { CharactersAPI, GuildAPI, EconomyAPI } = require("./modules/db");

require("dotenv").config();

/**
 * @type {Client}
 */
let client;
const app = express();

app.set("port", process.env.PORT);
app.use(cookieParser());
app.use(express.json());
app.use(express.static(__dirname + "/dashbord/src"));

app.get("/", (req, res) => {
  let accessToken = req.query.access_token;
  let scope = req.query.scope;
  let expires_in = req.query.expires_in;
  let token_type = req.query.token_type;

  if (accessToken) {
    res.cookie("token", accessToken, { maxAge: expires_in * 60 });
  }

  res.sendFile(__dirname + "/dashbord/pages/index.html");
});

app.get("/terms", (req, res) => {
  res.sendFile(__dirname + "/dashbord/pages/term-of-service.html");
});

app.get("/characters", (req, res) => {
  res.sendFile(__dirname + "/dashbord/pages/characters.html");
});

app.get("/setup-place", (req, res) => {
  res.sendFile(__dirname + "/dashbord/pages/setup-place.html");
});

app.get("/privacy", (req, res) => {
  res.sendFile(__dirname + "/dashbord/pages/privacy-policy.html");
});

app.post("/api/log/:msg", (req, res) => {
  console.log(req.params.msg);
});

app.get("/api/guilds/:id", (req, res) => {
  let guild = client ? client.guilds.cache.get(req.params.id) : Object();
  res.json(guild || Object());
});

app.get("/api/charas/:userId", async (req, res) => {
  let charaapi = new CharactersAPI(req.params.userId);
  let charas = await charaapi.getCharas();
  let updatedArr = [];

  for (let chara of charas) {
    updatedArr.push({ ...chara, stats: await charaapi.getStats(chara._id) });
    console.log(updatedArr);
  }

  res.json({
    charas: updatedArr.length === 0 ? charas : updatedArr,
  });
});

// Make online the dashbord

app.listen(app.get("port"), () =>
  console.log("Web server listening on port:" + app.get("port"))
);

/**
 *
 * @param {Client} xClient
 */
module.exports.setClient = (xClient) => {
  client = xClient;
};
