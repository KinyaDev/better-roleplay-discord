const {
  Client,
  REST,
  GatewayIntentBits,
  Routes,
  Events,
  ActivityType,
} = require("discord.js");

require("dotenv").config();

const fs = require("fs");
const path = require("path");

/**
 *
 * @param {(client: Client, {interactionFiles, eventFiles, annoucements}:{interactionFiles:string[], eventFiles:  string[], annoucements: string[]})=>void} callback
 */

module.exports = (callback) => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
    ],
    allowedMentions: { parse: [] },
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

  client.on(Events.ClientReady, async (c) => {
    let annoucements = require("./annoucements.json");
    callback(c, { interactionFiles, eventFiles, annoucements });
  });

  client.login(process.env.TOKEN);
};
