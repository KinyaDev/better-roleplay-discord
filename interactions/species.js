const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const { CharactersAPI } = require("../modules/db");

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

    const CharaSel = await require("../modules/charaSelectMenu")(
      interaction.user,
      interaction
    );

    let menu = await CharaSel.genMenu();

    let message = await interaction.editReply({
      content: "Select a character to se the species",
      components: menu.selectMenu.options.length > 1 ? [menu.row] : null,
      fetchReply: true,
    });

    let collector = CharaSel.genCollector(
      message,
      async (chara, charas, db) => {
        let currentChara = await db.getSelected();
        db.select(chara._id);
        db.setSpecies(species).then(() => set(interaction, "species"));
        db.select(currentChara._id);
      }
    );
  },
};
