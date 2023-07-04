const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const { guild, GuildAPI } = require("../modules/db");
let langs = Object.keys(require("../langs.json"));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("language")
    .setDescription(" Multilingual support with the /language [lang] command.")
    .addStringOption((option) =>
      option
        .setName("lang")
        .setDescription(
          `Language initials (choose between ${langs.join(", ")})`
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, db) => {
    let rp = new GuildAPI(interaction.guildId);

    let lang = interaction.options.getString("lang");
    if (langs.includes(lang)) {
      rp.setLang(lang);

      interaction.editReply((await rp.getLangData()).lang.replace("$", lang));
    } else {
      interaction.editReply(
        (await rp.getLangData())["no-lang"].replace("$", langs.join(", "))
      );
    }
  },
};
