const {
  Client,
  REST,
  GatewayIntentBits,
  Routes,
  Events,
  ActivityType,
} = require("discord.js");

var args = process.argv.slice(2);

const fs = require("fs");
require("dotenv").config();

const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.once(Events.ClientReady, async (c) => {
  console.log(
    `Ready! Logged in ${c.guilds.cache.size} servers as ${c.user.tag}`
  );

  client.user.setActivity({
    type: ActivityType.Listening,
    name: args ? args.join(" ") : "Ping me for help or use /help",
  });
});

const webhookify = require("./modules/webhooks")(client);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

client.commands = new Map();
client.events = new Map();

// Get files of interactions and events folders
let interactionFiles = fs.readdirSync(
  path.join(__dirname, "interactions"),
  "utf-8"
);
let eventFiles = fs.readdirSync(path.join(__dirname, "events"), "utf-8");

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
  try {
    let commands = [];
    client.commands.forEach((v, k) => {
      commands.push(v.data);
    });

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
