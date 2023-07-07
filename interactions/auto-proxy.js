const { SlashCommandBuilder } = require("discord.js");
const { AutoProxyAPI } = require("../modules/db");

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
    let autoproxy = new AutoProxyAPI(interaction.member.id);

    autoproxy.init();

    let channels = await autoproxy.channels();
    if (channels.includes(interaction.channelId)) {
      autoproxy.delAutoProxy(interaction.channelId);
      interaction
        .editReply({
          content: langdata.apdisa,
          ephemeral: true,
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 5000));
    } else {
      autoproxy.addAutoProxy(interaction.channelId);
      interaction
        .editReply({
          content: langdata.apena,
          ephemeral: true,
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 5000));
    }
  },
};
