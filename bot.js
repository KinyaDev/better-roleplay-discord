const { Client, GatewayIntentBits, Events } = require("discord.js");

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

client.login(process.env.TOKEN);

/**
 *
 * @param {(client: Client, {interactionFiles, eventFiles, annoucements}:{interactionFiles:string[], eventFiles:  string[], annoucements: string[]})=>Promise<void>} callback
 */
module.exports = (callback) => {
  client.on(Events.ClientReady, async (c) => {
    let annoucements = require("./annoucements.json");
    await callback(c, { annoucements });
  });
};
