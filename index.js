const { watchFile } = require("fs");
let botProcess = require("./bot");
require("./dashbord");
require("dotenv").config();
const chokidar = require("chokidar");
const { ActivityType } = require("discord.js");

function watch(callback) {
  chokidar
    .watch(`${__dirname}/bot.js`, { cwd: process.cwd() })
    .on("change", (path, stats) => {
      console.log(path);
      callback();
    });

  chokidar
    .watch(`${__dirname}/interactions`, { cwd: process.cwd() })
    .on("add", (eventName, path, stats) => {
      console.log(path);
      callback();
    })
    .on("change", (eventName, path, stats) => {
      console.log(path);
      callback();
    })
    .on("unlink", (eventName, path, stats) => {
      console.log(path);
      callback();
    });

  chokidar
    .watch(`${__dirname}/events`, { cwd: process.cwd() })
    .on("add", (eventName, path, stats) => {
      console.log(path);
      callback();
    })
    .on("change", (eventName, path, stats) => {
      console.log(path);
      callback();
    })
    .on("unlink", (eventName, path, stats) => {
      console.log(path);
      callback();
    });

  chokidar
    .watch(`${__dirname}/modules`, { cwd: process.cwd() })
    .on("add", (eventName, path, stats) => {
      console.log(path);
      callback();
    })
    .on("change", (eventName, path, stats) => {
      console.log(path);
      callback();
    })
    .on("unlink", (eventName, path, stats) => {
      console.log(path);
      callback();
    });

  chokidar
    .watch(`${__dirname}/components`, { cwd: process.cwd() })
    .on("add", (eventName, path, stats) => {
      console.log(path);
      callback();
    })
    .on("change", (eventName, path, stats) => {
      console.log(path);
      callback();
    })
    .on("unlink", (eventName, path, stats) => {
      console.log(path);
      callback();
    });
}

function restart() {
  console.clear();

  botProcess((client, { annoucements, eventFiles, interactionFiles }) => {
    console.log(
      `Logged in as ${client.user.username} in ${client.guilds.cache.size} servers.`
    );

    setInterval(() => {
      client.user.setActivity({
        type: ActivityType.Watching,
        name: annoucements[Math.floor(Math.random() * annoucements.length)],
      });
    }, 5000);

    // watch(() => {
    //   client.destroy();
    //   botProcess = require("./bot");
    //   restart();
    // });
  });
}

restart();
