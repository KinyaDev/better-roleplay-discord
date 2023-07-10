const { SlashCommandBuilder } = require("discord.js");
const { CharactersAPI } = require("../modules/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unregister")
    .setDescription("Remove characters with the /unregister command."),
  /**
   *
   * @param {Client} client
   * @param {import("discord.js").CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const CharaSel = await require("../modules/charaSelectMenu")(
      interaction.user,
      interaction
    );

    let menu = await CharaSel.genMenu();

    let message = await interaction.editReply({
      content: `Select a character to delete`,
      components: menu.selectMenu.options.length >= 1 ? [menu.row] : null,
      fetchReply: true,
    });

    let collector = CharaSel.genCollector(
      message,
      async (chara, charas2, db) => {
        let currentChara = await db.getSelected();
        db.select(chara._id);
        if (await db.delChara()) {
          interaction.editReply({
            content: `Your character, ${chara.name} has been deleted.`,
            components: [],
          });
        }

        db.select(currentChara._id);

        let charas = await db.getCharas();
        let newChara = charas[charas.length - 1];

        if (newChara && (await db.getChara(newChara._id))) {
          db.select(newChara._id);
        }
      }
    );
  },
};
