const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bio")
    .setDescription("Craft captivating backstory with the /bio command.")
    .addStringOption((option) =>
      option
        .setName("bio")
        .setDescription("The bio to set to your character")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, db, langdata) => {
    let bio = interaction.options.getString("bio");

    if (db.getSelected()) {
      db.setBio(bio);

      interaction
        .editReply({
          content: langdata.bio,
          ephemeral: true,
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 5000));
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
