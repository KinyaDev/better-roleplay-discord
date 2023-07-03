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
  run: async (client, interaction, db, langdata) => {
    let name = interaction.options.getString("name");

    let chara = await db.getSelected();
    if (await db.setStats(name, 0)) {
      interaction.editReply({
        content: langdata.statdel.replace("$1", name).replace("$2", chara.name),
        ephemeral: true,
      });
    } else {
      interaction.editReply({
        content: langdata["no-chara"],
        ephemeral: true,
      });
    }
  },
};
