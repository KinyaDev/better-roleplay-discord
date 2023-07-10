const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  Client,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Access guidance with the /help command. Friendly support team available."
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { helpCommand } = require("../modules/embeds");
    await helpCommand(interaction);
  },
  runMessage: async (client, message) => {
    const { helpCommand } = require("../modules/embeds");
    await helpCommand(message);
  },
};
