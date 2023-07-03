const { SlashCommandBuilder } = require("discord.js");
const DB = require("../modules/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("auto-proxy")
    .setDescription(
      "Enable/disable auto-proxy in any channel with the /auto-proxy command."
    ),
  /**
   *
   * @param {Client} client
   * @param {import("discord.js").CommandInteraction} interaction
   */
  run: async (client, interaction, db, langdata) => {
    let autoproxy = DB.autoProxy(interaction.member.id);

    autoproxy.init();

    let channels = await autoproxy.channels();
    if (channels.includes(interaction.channelId)) {
      autoproxy.delAutoProxy(interaction.channelId);
      interaction.editReply({
        content: langdata.apdisa,
        ephemeral: true,
      });
    } else {
      autoproxy.addAutoProxy(interaction.channelId);
      interaction.editReply({
        content: langdata.apena,
        ephemeral: true,
      });
    }
  },
};
