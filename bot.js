const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  ActivityType,
} = require("discord.js");

const { loadCommands, loadEvents } = require("./load");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  allowedMentions: { parse: [] },
});

client.commands = new Map();
client.events = new Map();

client.on(Events.ClientReady, async (c) => {
  let annoucements = require("./annoucements.json");

  await loadCommands(client);
  await loadEvents(client);

  // Deploying commands
  (async () => {
    try {
      // Construct and prepare an instance of the REST module
      const rest = new REST().setToken(process.env.TOKEN);

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

  setInterval(() => {
    client.user.setActivity({
      type: ActivityType.Playing,
      name: annoucements[
        Math.floor(Math.random() * annoucements.length)
      ].replace("$guilds", client.guilds.cache.size),
    });
  }, 5000);

  console.log(
    `Logged in as ${client.user.username} in ${client.guilds.cache.size} servers.`
  );
});

client.login(process.env.TOKEN);
