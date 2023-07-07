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
  run: async (client, interaction, db, langdata) => {
    if (await db.delChara()) {
      interaction.editReply({
        content: langdata.unregister,
        ephemeral: true,
      });

      let len = (await db.getCharas()).length - 1;

      if (await db.getChara(len)) {
        db.select(len);
      }
    } else {
      interaction
        .editReply({
          content: langdata["no-chara"],
          ephemeral: true,
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 5000));
    }
  },
};
