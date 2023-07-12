const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { CharactersAPI } = require("../modules/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats-del")
    .setDescription("Remove stats with the /stats-del command."),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    let db = new CharactersAPI(interaction.user.id);
    let chara = await db.getSelected();
    if (chara) {
      let stats = await db.getStats(chara._id);

      let selectMenu = new StringSelectMenuBuilder()
        .setCustomId("stats-del")
        .setPlaceholder("Select a stat to delete");

      stats.forEach((stat) => {
        selectMenu.addOptions({ label: stat.name, value: stat.name });
      });

      if (selectMenu.options.length === 0) {
        interaction.editReply("You have no stats to delete!");
      } else {
        let message = await interaction.editReply({
          content: `Select a stat to delete`,
          components: [new ActionRowBuilder().addComponents(selectMenu)],
        });

        let collector = message.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          max: 1,
        });

        collector.on("collect", async (i) => {
          let statName = i.values[0];

          if (await db.setStats(statName, 0)) {
            interaction.editReply({
              content: `Stat ${statName} has been deleted for ${chara.name}.`,
              components: [],
            });
          }
        });
      }
    }
  },
};
