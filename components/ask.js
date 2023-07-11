const { ButtonInteraction } = require("discord.js");
const { GuildAPI } = require("../modules/db");
require("dotenv").config();
/**
 *
 * @param {ButtonInteraction} interaction
 * @param {*} db
 */
let askInteraction = async (interaction) => {
  if (interaction.customId === "ask") {
    interaction.reply({
      content: "Send now your question here.",
      ephemeral: true,
    });

    const msg_filter = (m) => m.author.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessages({
      filter: msg_filter,
      max: 1,
    });

    let questionChannel = interaction.client.channels.cache.get(
      process.env.QUESTIONS_CHANNEL
    );

    let msg = collected.first();
    if (questionChannel) {
      questionChannel.send(`${msg.author}'s question: ${msg.content}`);
      interaction.deleteReply();
    }

    msg.delete();
  }
};

module.exports = askInteraction;
