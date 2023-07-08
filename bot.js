const {
  Client,
  REST,
  GatewayIntentBits,
  Routes,
  Events,
  ActivityType,
} = require("discord.js");

const chokidar = require("chokidar");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  allowedMentions: { parse: [] },
});

client.on(Events.ClientReady, async (c) => {
  console.log(
    `Ready! Logged in ${c.guilds.cache.size} servers as ${c.user.tag}`
  );

  setInterval(() => {
    let annoucements = require("./annoucements.json");

    client.user.setActivity({
      type: ActivityType.Listening,
      name: annoucements[Math.floor(Math.random() * annoucements.length)],
    });
  }, 6000);
});

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

client.commands = new Map();
client.events = new Map();

// Get files of interactions and events folders
let interactionFiles = fs.readdirSync(
  path.join(__dirname, "interactions"),
  "utf-8"
);

chokidar
  .watch(path.join(__dirname, "interactions"))
  .on("add", (path2, stats) => {
    interactionFiles = fs.readdirSync(
      path.join(__dirname, "interactions"),
      "utf-8"
    );
  })
  .on("unlink", (path2, stats) => {
    interactionFiles = fs.readdirSync(
      path.join(__dirname, "interactions"),
      "utf-8"
    );
  });

let eventFiles = fs.readdirSync(path.join(__dirname, "events"), "utf-8");

chokidar
  .watch(path.join(__dirname, "events"))
  .on("add", (path2, stats) => {
    eventFiles = fs.readdirSync(path.join(__dirname, "events"), "utf-8");
  })
  .on("unlink", (path2, stats) => {
    eventFiles = fs.readdirSync(path.join(__dirname, "events"), "utf-8");
  });

// Load event files

for (let f of eventFiles) {
  if (f.endsWith(".js")) {
    let name = f.replace(".js", "");
    let req = require(path.join(__dirname, "events", f));

    if (req) {
      client.events.set(name, req);
      if (req) {
        console.log(`Registered ${name} event.`);
      } else {
        console.log(`Failed to load ${f}.`);
      }
    } else {
      console.log(`Failed to load ${f}.`);
    }
  }
}

// Load interaction files

for (let f of interactionFiles) {
  if (f.endsWith(".js")) {
    let name = f.replace(".js", "");
    let req = require(path.join(__dirname, "interactions", f));

    if (req) {
      client.commands.set(req.data.name, req);
      if (req.data) {
        console.log(`Registered /${name} command.`);
      } else {
        console.log(`Failed to load ${f}.`);
      }
    } else {
      console.log(`Failed to load ${f}.`);
    }
  }
}

// Deploying commands
(async () => {
  let watcher = chokidar.watch(`${__dirname}/interactions`);

  watcher.on("error", (err) => {
    throw err;
  });

  function doTheThing() {
    for (let f of interactionFiles) {
      if (f.endsWith(".js")) {
        let name = f.replace(".js", "");
        let req = require(path.join(__dirname, "interactions", f));

        if (req) {
          client.commands.set(req.data.name, req);
          if (req.data) {
            console.log(`Registered /${name} command.`);
          } else {
            console.log(`Failed to load ${f}.`);
          }
        } else {
          console.log(`Failed to load ${f}.`);
        }
      }
    }
  }
  watcher
    .on("add", (path2, stats) => doTheThing)
    .on("change", doTheThing)
    .on("unlink", doTheThing);

  try {
    let commands = [];
    client.commands.forEach((v) => commands.push(v.data));
    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: commands,
      }
    );

    console.log(
      `Successfully loaded ${commands.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

for (let [name, req] of client.events) {
  client.on(name, (args) => {
    req(client, args);
  });
}

client.login(process.env.TOKEN);
module.exports = client;
