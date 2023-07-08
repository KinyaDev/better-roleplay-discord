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
    const { helpEmbed, placeSystemEmbed } = require("../modules/embeds");

    let btn = new ButtonBuilder()
      .setCustomId("ask")
      .setLabel("Ask")
      .setStyle(ButtonStyle.Primary);

    let row = new ActionRowBuilder().setComponents(btn);
    interaction.editReply({
      embeds: [
        helpEmbed,
        placeSystemEmbed,
        {
          title: "F.A.Q",
          description: "There are no frequently asked questions. Ask now!",
          footer: { text: "Created by KinyaDev" },
        },
      ],
      components: [row],
      ephemeral: false,
    });
  },
  runMessage: async (client, message) => {
    const { helpEmbed, placeSystemEmbed } = require("../modules/embeds");

    let btn = new ButtonBuilder()
      .setCustomId("ask")
      .setLabel("Ask")
      .setStyle(ButtonStyle.Primary);

    let row = new ActionRowBuilder().setComponents(btn);
    message.reply({
      embeds: [
        helpEmbed,
        placeSystemEmbed,
        {
          title: "F.A.Q",
          description: "There are no frequently asked questions. Ask now!",
          footer: { text: "Created by KinyaDev" },
        },
      ],
      components: [row],
    });
  },
};
