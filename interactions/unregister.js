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
    let db = new CharactersAPI(interaction.user.id);
    let chara = await db.getSelected();

    if (await db.delChara()) {
      interaction.editReply({
        content: `Your character, ${chara.name} has been deleted.`,
        components: [],
      });
    }

    let charas = await db.getCharas();
    let newChara = charas[charas.length - 1];

    if (newChara && (await db.getChara(newChara._id))) {
      db.select(newChara._id);
    }
  },
};
