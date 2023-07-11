const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const { CharactersAPI } = require("../modules/db");

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

    const CharaSel = await require("../modules/charaSelectMenu")(
      interaction.user,
      interaction
    );

    let menu = await CharaSel.genMenu();

    let message = interaction.editReply({
      content: "Select a character to set the stat",
      components: menu.selectMenu.options.length >= 1 ? [menu.row] : null,
      fetchReply: true,
    });

    let collector = CharaSel.genCollector(
      message,
      async (chara, charas, db) => {
        let currentChara = await db.getSelected();
        db.select(chara._id);
        if (await db.setStats(name, 0)) {
          interaction.editReply({
            content: `Stat ${name} has been deleted for ${chara.name}.`,
            components: [],
          });
        }
        db.select(currentChara._id);
      }
    );
  },
};
