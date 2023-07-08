const { SlashCommandBuilder } = require("discord.js");

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
    const charaSelectMenu = require("../modules/charaSelectMenu");

    let selectmenu = await charaSelectMenu(
      interaction.user,
      interaction,
      "all"
    );

    let msg = await interaction.editReply({
      content: `Select a character to delete`,
      components: [selectmenu.row],
    });

    selectmenu(
      () => msg,
      async (chara, charas, db) => {
        if (await db.delChara()) {
          interaction.editReply({
            content: `Your character, ${chara.name} has been deleted.`,
            components: [],
            ephemeral: true,
          });

          let newChara = charas[charas.length - 1];

          if (await db.getChara(newChara._id)) {
            db.select(newChara._id);
          }
        }
      }
    );
  },
};
