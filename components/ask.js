const { ButtonInteraction } = require("discord.js");
const { GuildAPI } = require("../modules/db");

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

    let questionChannel = await interaction.guild.channels.fetch(
      "1124969295370272860"
    );

    let msg = collected.first();
    questionChannel.send(`${msg.author}'s question: ${msg.content}`);
    interaction.deleteReply();

    msg.delete();
  }
};

module.exports = askInteraction;
