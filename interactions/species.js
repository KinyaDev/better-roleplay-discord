const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("species")
    .setDescription("Define character's species with the /species command.")
    .addStringOption((option) =>
      option
        .setName("species")
        .setDescription("The species to set to your character")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, db, langdata) => {
    let species = interaction.options.getString("species");

    if (db.getSelected()) {
      db.setSpecies(species);

      interaction.editReply({
        content: langdata.species,
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
