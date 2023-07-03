const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription(
      "Personalize character's appearance with the /avatar [avatar] command."
    )
    .addStringOption((option) =>
      option
        .setName("avatar")
        .setDescription("URL of the avatar to set")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, db, langdata) => {
    let url = interaction.options.getString("avatar");

    if (db.getSelected()) {
      db.setAvatar(url);

      interaction.editReply({
        content: langdata.avatar,
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
