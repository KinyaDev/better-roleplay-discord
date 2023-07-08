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
  run: async (client, interaction) => {
    const { set } = require("../modules/errors");
    let species = interaction.options.getString("species");

    const charaSelectMenu = require("../modules/charaSelectMenu");

    let selectmenu = await charaSelectMenu(
      interaction.user,
      interaction,
      "all"
    );

    let msg = await interaction.editReply({
      content: `Select a character to set the species`,
      components: [selectmenu.row],
    });

    selectmenu(
      () => msg,
      async (chara, charas, db) => {
        let currentChara = await db.getSelected();
        db.select(chara._id);
        db.setSpecies(species).then(() => set(interaction, "bio"));
        db.select(currentChara._id);
      }
    );
  },
};
