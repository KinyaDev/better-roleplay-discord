const { SlashCommandBuilder } = require("discord.js");

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
  run: async (client, interaction) => {
    const { AutoProxyAPI } = require("../modules/db");
    const { autoProxy } = require("../modules/errors");
    let autoproxy = new AutoProxyAPI(interaction.member.id);

    autoproxy.init();

    let channels = await autoproxy.channels();
    if (channels.includes(interaction.channelId)) {
      autoproxy.delAutoProxy(interaction.channelId);
      autoProxy(interaction, "disabled");
    } else {
      autoproxy.addAutoProxy(interaction.channelId);
      autoProxy(interaction, "enabled");
    }
  },
};
