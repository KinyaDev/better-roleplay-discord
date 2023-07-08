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
  run: async (client, interaction) => {
    const { noChara, set } = require("../modules/errors");
    const { CharactersAPI } = require("../modules/db");

    let db = new CharactersAPI(interaction.user.id);
    let bio = interaction.options.getString("bio");

    if (await db.getSelected())
      db.setBio(bio).then(() => set(interaction, "bio"));
    else noChara(interaction);
  },
};
