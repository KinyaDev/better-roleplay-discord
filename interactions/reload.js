const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload commands"),

  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    for (const [key, value] of client.events) {
      client.removeListener(key);
      client.on(key, value);
    }
  },
};
