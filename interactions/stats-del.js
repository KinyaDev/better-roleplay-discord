const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats-del")
    .setDescription("Remove stats with the /stats-del command.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the stat to delete to your character")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    let name = interaction.options.getString("name");

    const charaSelectMenu = require("../modules/charaSelectMenu");

    let selectmenu = await charaSelectMenu(
      interaction.user,
      interaction,
      "all"
    );

    let msg = await interaction.editReply({
      content: `Select a character to del a stat`,
      components: [selectmenu.row],
    });

    selectmenu(
      () => msg,
      async (chara, charas, db) => {
        let currentChara = await db.getSelected();

        db.select(chara._id);
        if (await db.setStats(name, 0)) {
          interaction.editReply({
            content: `Stat ${name} has been deleted for ${chara.name}`,
            components: [],
          });
        }
        db.select(currentChara._id);
      }
    );
  },
};
