const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Message by your character")
    .addStringOption((opt) =>
      opt
        .setName("message")
        .setDescription("The message which will be send by your character.")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const webhooks = require("../modules/webhooks");
    const { CharactersAPI } = require("../modules/db");
    const { noChara } = require("../modules/errors");

    const webhookify = webhooks(client);

    let db = new CharactersAPI(interaction.user.id);
    let chara = await db.getSelected();
    let message = interaction.options.getString("message");

    if (chara) {
      if (message.length > 2000) {
        interaction
          .editReply({
            content: `Error. Message must be 2000 or fewer.`,
            ephemeral: true,
          })
          .then(() => setTimeout(() => interaction.deleteReply(), 5000));
      } else {
        let stats = await db.getStats();

        stats.forEach((s, i) => {
          message = message.replace(`$${i + 1}`, `${s.name}: ${s.value}`);
        });

        await webhookify.send(
          interaction.channelId,
          chara.name,
          chara.avatar || interaction.member.displayAvatarURL(),
          message
        );
      }
    } else noChara(interaction);
  },
};
