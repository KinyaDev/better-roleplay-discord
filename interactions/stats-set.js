const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats-set")
    .setDescription("Define custom stats with the /stats-set command.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the stat to set to your character")
        .setRequired(true)
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
    let name = interaction.options.getString("name");
    let value = interaction.options.getNumber("value");

    const charaSelectMenu = require("../modules/charaSelectMenu");

    let selectmenu = await charaSelectMenu(
      interaction.user,
      interaction,
      "all"
    );

    let msg = await interaction.editReply({
      content: `Select a character to set a stat`,
      components: [selectmenu.row],
    });

    selectmenu(
      () => msg,
      async (chara, charas, db) => {
        let currentChara = await db.getSelected();

        db.select(chara._id);
        if (await db.setStats(name, value)) {
          interaction.editReply({
            content: `Stat ${name} has been added to ${chara.name} with value ${value}`,
            components: [],
          });
        }
        db.select(currentChara._id);
      }
    );
  },
};
