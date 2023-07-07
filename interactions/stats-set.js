const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats-set")
    .setDescription("Define custom stats with the /stats-set command.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the stat to set to your character")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("value")
        .setDescription("The value of the stat to set to your character")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, db, langdata) => {
    let name = interaction.options.getString("name");
    let value = interaction.options.getNumber("value");

    let chara = await db.getSelected();

    if (await db.setStats(name, value)) {
      interaction.editReply({
        content: langdata.statset
          .replace("$1", name)
          .replace("$2", value)
          .replace("$3", chara.name),
        ephemeral: true,
      });
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
