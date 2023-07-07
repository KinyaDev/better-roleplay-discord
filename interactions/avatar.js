const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const isImageUrl = require("is-image-url");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription(
      "Personalize character's appearance with the /avatar [avatar] command."
    )
    .addAttachmentOption((option) =>
      option
        .setName("avatar")
        .setDescription("The image of the avatar.")
        .setRequired(true)
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, db, langdata) => {
    let url = interaction.options.getAttachment("avatar").url;

    if (db.getSelected()) {
      if (isImageUrl(url)) {
        db.setAvatar(url);

        interaction.editReply({
          content: langdata.avatar,
          files: [url],
        });
      } else
        interaction
          .editReply("Invalid image url")
          .then(() => setTimeout(() => interaction.deleteReply(), 5000));
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
