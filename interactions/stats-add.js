const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const { CharactersAPI } = require("../modules/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats-add")
    .setDescription("Add custom stats with the /stats-add command.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the stat to add to your character")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("value")
        .setDescription("The value of the stat to add to your character")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    let name = interaction.options.getString("name");
    let value = interaction.options.getNumber("value");
    let db = new CharactersAPI(interaction.user.id);
    let chara = await db.getSelected();

    if (chara) {
      if (await db.setStats(name, value)) {
        interaction.editReply({
          content: `Stat ${name} has been added to ${chara.name} with value ${value}`,
          components: [],
        });
      }
    }
  },
};
