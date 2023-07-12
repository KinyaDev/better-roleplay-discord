const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { CharactersAPI } = require("../modules/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats-set")
    .setDescription(
      "Select a custom stat and redefine it with the /stats-set command."
    )

    .addNumberOption((option) =>
      option
        .setName("value")
        .setDescription("The value of the stat to set to your character")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    let db = new CharactersAPI(interaction.user.id);
    let chara = await db.getSelected();
    let value = interaction.options.getNumber("value");

    if (chara) {
      let stats = await db.getStats(chara._id);

      let selectMenu = new StringSelectMenuBuilder()
        .setCustomId("stats-del")
        .setPlaceholder("Select a stat to update");

      stats.forEach((stat) => {
        selectMenu.addOptions({ label: stat.name, value: stat.name });
      });

      if (selectMenu.options.length === 0) {
        interaction.editReply("You have no stat to update!");
      } else {
        let message = await interaction.editReply({
          content: `Select a stat to update`,
          components: [new ActionRowBuilder().addComponents(selectMenu)],
        });

        let collector = message.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          max: 1,
        });

        collector.on("collect", async (i) => {
          let statName = i.values[0];

          if (await db.setStats(statName, value)) {
            interaction.editReply({
              content: `Stat ${statName} has been updated to ${value} for ${chara.name}.`,
              components: [],
            });
          }
        });
      }
    }
  },
};
