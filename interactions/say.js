const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const webhooks = require("../modules/webhooks");

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
  run: async (client, interaction, db, langdata) => {
    const webhookify = webhooks(client);

    let chara = await db.getSelected();
    let message = interaction.options.getString("message");

    if (chara) {
      if (message.length > 2000) {
        interaction.editReply({
          content: `Error. Message must be 2000 or fewer.`,
          ephemeral: true,
        });
      } else {
        let stats = await db.getStats();

        stats.forEach((s, i) => {
          message = message.replace(`$${i}`, `${s.name}: ${s.value}`);
        });

        await webhookify.send(
          interaction.channelId,
          chara.name,
          chara.avatar || interaction.member.displayAvatarURL(),
          message
        );
      }
    } else {
      interaction.editReply({
        content: langdata["no-chara"],
        ephemeral: true,
      });
    }
  },
};
